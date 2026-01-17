import fs from "fs";
import path from "path";
import crypto from "crypto";
import Razorpay from "razorpay";

import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";

/* ================= LOGGING ================= */

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, "razorpay-webhook.txt");

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

    if (purchase.status === "completed") return;

    const user = await User.findById(purchase.userId);
    const course = await Course.findById(purchase.courseId);

    if (!user || !course) {
      writeLog("USER_OR_COURSE_MISSING", { user, course });
      return;
    }

    /* FORCE ENROLL USER */
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
      await user.save();
    }

    if (!course.enrolledStudents.includes(user._id)) {
      course.enrolledStudents.push(user._id);
      await course.save();
    }

    purchase.status = "completed";
    purchase.paymentId = payment.id;
    await purchase.save();

    writeLog("ENROLLMENT_SUCCESS", {
      userId: user._id,
      courseId: course._id,
    });
  } catch (err) {
    writeLog("PAYMENT_SUCCESS_ERROR", err.message);
  }
};

/* ================= PAYMENT FAILED ================= */

const handlePaymentFailed = async (payment) => {
  try {
    const purchase =
      payment.notes?.purchaseId &&
      (await Purchase.findById(payment.notes.purchaseId));

    if (!purchase) return;

    purchase.status = "failed";
    purchase.paymentId = payment.id;
    await purchase.save();

    writeLog("PAYMENT_FAILED", purchase);
  } catch (err) {
    writeLog("PAYMENT_FAILED_ERROR", err.message);
  }
};

/* ================= WEBHOOK ================= */

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (expected !== signature) {
    writeLog("INVALID_SIGNATURE", req.body.toString());
    return res.status(400).json({ success: false });
  }

  const event = JSON.parse(req.body.toString());
  writeLog("WEBHOOK_EVENT", event.event);

  switch (event.event) {
    case "payment.captured":
    case "order.paid":
      await handlePaymentSuccess(event.payload.payment.entity);
      break;

    case "payment.failed":
      await handlePaymentFailed(event.payload.payment.entity);
      break;

    default:
      writeLog("UNHANDLED_EVENT", event.event);
  }

  res.json({ status: "ok" });
};