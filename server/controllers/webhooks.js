import fs from "fs";
import path from "path";
import crypto from "crypto";

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

    // Prevent double processing
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

    /* ================= ENROLL USER ================= */

    // Safe ObjectId comparison
    if (
      !user.enrolledCourses.some(
        (id) => id.toString() === course._id.toString()
      )
    ) {
      user.enrolledCourses.push(course._id);
      await user.save();
    }

    // Course enrolled students (string userId)
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
      purchaseId: purchase._id,
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

/* ================= RAZORPAY WEBHOOK ================= */

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body) // RAW BODY BUFFER
      .digest("hex");

    if (expectedSignature !== signature) {
      writeLog("INVALID_SIGNATURE", req.body.toString());
      return res.status(400).json({ success: false });
    }

    const event = JSON.parse(req.body.toString());
    writeLog("WEBHOOK_EVENT", event.event);

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
        writeLog("UNHANDLED_EVENT", event.event);
    }

    res.json({ status: "ok" });
  } catch (error) {
    writeLog("WEBHOOK_ERROR", error.message);
    res.status(500).json({ success: false });
  }
};

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = JSON.stringify(req.body); // Use req.rawBody if available

        await whook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: (data.first_name || "") + " " + (data.last_name || ""),
                    imageUrl: data.image_url || "",
                };
                await User.create(userData);
                return res.json({});
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: (data.first_name || "") + " " + (data.last_name || ""),
                    imageUrl: data.image_url || "",
                };
                await User.findByIdAndUpdate(data.id, userData);
                return res.json({});
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.json({});
            }

            default:
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


