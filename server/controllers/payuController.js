import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";

import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

/* ================= PAYU LOGGING ================= */

// logs folder at project root
const logDir = path.join(process.cwd(), "logs");

// ensure logs folder exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// PayU log file
const LOG_FILE = path.join(logDir, "payu-callback-log.txt");

// log helper
const logPayUData = (title, data) => {
  fs.appendFileSync(
    LOG_FILE,
    `\n\n===== ${title} =====
Time: ${new Date().toISOString()}
${JSON.stringify(data, null, 2)}
`,
    "utf8"
  );
};

/* ================= PAYU SUCCESS ================= */

export const payuSuccess = async (req, res) => {
  try {
    // 🔹 log full PayU response
    logPayUData("PAYU SUCCESS CALLBACK", req.body);

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      udf1, // purchaseId
    } = req.body;

    const salt = process.env.PAYU_SALT;
    const key = process.env.PAYU_KEY;

    /* 🔐 PayU response hash verification */
    const hashString =
      salt +
      "|" +
      status +
      "|||||||" +
      email +
      "|" +
      firstname +
      "|" +
      productinfo +
      "|" +
      amount +
      "|" +
      txnid +
      "|" +
      key;

    const calculatedHash = CryptoJS.SHA512(hashString).toString(
      CryptoJS.enc.Hex
    );

    if (calculatedHash !== hash) {
      logPayUData("PAYU HASH MISMATCH", {
        receivedHash: hash,
        calculatedHash,
      });

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed`
      );
    }

    /* 🔎 Find purchase */
    const purchase = await Purchase.findById(udf1);
    if (!purchase) {
      logPayUData("PURCHASE NOT FOUND", { udf1 });

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed`
      );
    }

    /* ✅ Update purchase */
    purchase.status = "success";
    await purchase.save();

    /* ✅ Enroll user */
    const user = await User.findById(purchase.userId);
    if (!user.enrolledCourses.includes(purchase.courseId)) {
      user.enrolledCourses.push(purchase.courseId);
      await user.save();
    }

    logPayUData("PAYMENT COMPLETED", {
      purchaseId: purchase._id,
      userId: user._id,
      courseId: purchase.courseId,
      txnid,
      amount,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/loading/my-enrollments`
    );
  } catch (error) {
    logPayUData("PAYU SUCCESS ERROR", {
      message: error.message,
      stack: error.stack,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed`
    );
  }
};

/* ================= PAYU FAILURE ================= */

export const payuFailure = (req, res) => {
  // 🔴 log failure response
  logPayUData("PAYU FAILURE CALLBACK", req.body);

  return res.redirect(
    `${process.env.FRONTEND_URL}/payment-failed`
  );
};