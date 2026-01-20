import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

/* --------- ROOT PATH SETUP --------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// root folder (one level up from controllers)
const ROOT_DIR = path.join(__dirname, "..", "..");
const LOG_FILE = path.join(ROOT_DIR, "payu-callback-log.txt");

/* --------- LOG FUNCTION --------- */
const logPayUData = (title, data) => {
  const log = `
==============================
${title}
Time: ${new Date().toISOString()}
------------------------------
${JSON.stringify(data, null, 2)}
==============================

`;
  fs.appendFileSync(LOG_FILE, log, { encoding: "utf8" });
};

/* --------- SUCCESS CALLBACK --------- */
export const payuSuccess = async (req, res) => {
  try {
    // 🔹 Log raw PayU data immediately
    logPayUData("PAYU SUCCESS CALLBACK", req.body);

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      udf1,
    } = req.body;

    const salt = process.env.PAYU_SALT;
    const key = process.env.PAYU_KEY;

    // 🔐 Hash verification
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

    const purchase = await Purchase.findById(udf1);
    if (!purchase) {
      logPayUData("PURCHASE NOT FOUND", { udf1 });
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed`
      );
    }

    purchase.status = "success";
    await purchase.save();

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

/* --------- FAILURE CALLBACK --------- */
export const payuFailure = (req, res) => {
  // 🔴 Log failure data
  logPayUData("PAYU FAILURE CALLBACK", req.body);

  return res.redirect(
    `${process.env.FRONTEND_URL}/payment-failed`
  );
};