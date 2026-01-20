import fs from "fs";
import path from "path";
import CryptoJS from "crypto-js";
import { Webhook } from "svix";

import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";

/* ================= LOGGING ================= */

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, "webhooks.txt");

const writeLog = (title, data) => {
  fs.appendFileSync(
    logFile,
    `\n\n===== ${title} =====\n${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
};

/* ================= PAYMENT SUCCESS ================= */

const handlePaymentSuccess = async (payment) => {
  try {
    writeLog("PAYMENT_SUCCESS_RAW", payment);

    const purchase =
      (payment.notes?.purchaseId &&
        await Purchase.findById(payment.notes.purchaseId)) ||
      (payment.order_id &&
        await Purchase.findOne({ razorpayOrderId: payment.order_id }));

    if (!purchase) {
      writeLog("PURCHASE_NOT_FOUND", payment);
      return;
    }

    if (purchase.status === "completed") {
      writeLog("ALREADY_COMPLETED", purchase._id);
      return;
    }

    const user = await User.findById(purchase.userId);
    const course = await Course.findById(purchase.courseId);

    if (!user || !course) {
      writeLog("USER_OR_COURSE_MISSING", {
        userId: purchase.userId,
        courseId: purchase.courseId,
      });
      return;
    }

    // Enroll user
    if (!user.enrolledCourses.some(id => id.toString() === course._id.toString())) {
      user.enrolledCourses.push(course._id);
      await user.save();
    }

    if (!course.enrolledStudents.some(id => id.toString() === user._id.toString())) {
      course.enrolledStudents.push(user._id);
      await course.save();
    }

    purchase.status = "completed";
    purchase.paymentId = payment.id || payment.txnid;
    await purchase.save();

    writeLog("ENROLLMENT_SUCCESS", {
      purchaseId: purchase._id,
      userId: user._id,
      courseId: course._id,
    });
  } catch (error) {
    writeLog("PAYMENT_SUCCESS_ERROR", error.message);
  }
};

/* ================= PAYMENT FAILED ================= */

const handlePaymentFailed = async (payment) => {
  try {
    const purchase =
      payment.notes?.purchaseId &&
      await Purchase.findById(payment.notes.purchaseId);

    if (!purchase) return;

    purchase.status = "failed";
    purchase.paymentId = payment.id || payment.txnid;
    await purchase.save();

    writeLog("PAYMENT_FAILED", purchase._id);
  } catch (error) {
    writeLog("PAYMENT_FAILED_ERROR", error.message);
  }
};

/* ================= RAZORPAY WEBHOOK ================= */

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // RAW BODY → STRING
    const body = req.body.toString();

    // HMAC SHA256 using crypto-js
    const expectedSignature = CryptoJS.HmacSHA256(body, secret)
      .toString(CryptoJS.enc.Hex);

    if (expectedSignature !== signature) {
      writeLog("RAZORPAY_INVALID_SIGNATURE", body);
      return res.status(400).json({ success: false });
    }

    const event = JSON.parse(body);
    writeLog("RAZORPAY_EVENT", event.event);

    switch (event.event) {
      case "payment.authorized":
      case "payment.captured":
      case "order.paid":
        await handlePaymentSuccess(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      default:
        writeLog("RAZORPAY_UNHANDLED_EVENT", event.event);
    }

    res.json({ status: "ok" });
  } catch (error) {
    writeLog("RAZORPAY_WEBHOOK_ERROR", error.message);
    res.status(500).json({ success: false });
  }
};

/* ================= PAYU WEBHOOK ================= */

export const payuWebhook = async (req, res) => {
  try {
    const salt = process.env.PAYU_SALT;
    const payuHash = req.body.hash;

    if (!payuHash) {
      writeLog("PAYU_NO_HASH", req.body);
      return res.status(400).json({ success: false });
    }

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      key,
      udf1, // purchaseId
    } = req.body;

    const hashString =
      `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    const expectedHash = CryptoJS.SHA512(hashString)
      .toString(CryptoJS.enc.Hex);

    if (expectedHash !== payuHash) {
      writeLog("PAYU_INVALID_HASH", req.body);
      return res.status(400).json({ success: false });
    }

    if (status === "success") {
      await handlePaymentSuccess({
        txnid,
        notes: { purchaseId: udf1 },
      });
    } else {
      await handlePaymentFailed({
        txnid,
        notes: { purchaseId: udf1 },
      });
    }

    writeLog("PAYU_EVENT", status);
    res.json({ status: "ok" });
  } catch (error) {
    writeLog("PAYU_WEBHOOK_ERROR", error.message);
    res.status(500).json({ success: false });
  }
};

/* ================= CLERK WEBHOOK ================= */

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const payload = JSON.stringify(req.body);

    await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created":
        await User.create({
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          imageUrl: data.image_url || "",
        });
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, {
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          imageUrl: data.image_url || "",
        });
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        writeLog("CLERK_UNHANDLED_EVENT", type);
    }

    res.json({});
  } catch (error) {
    writeLog("CLERK_WEBHOOK_ERROR", error.message);
    res.status(400).json({ success: false });
  }
};