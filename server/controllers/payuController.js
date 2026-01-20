import CryptoJS from "crypto-js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";

export const payuSuccess = async (req, res) => {
  try {
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

    // ✅ PayU response hash verification
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
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed`
      );
    }

    const purchase = await Purchase.findById(udf1);
    if (!purchase) {
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

    return res.redirect(
      `${process.env.FRONTEND_URL}/loading/my-enrollments`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failed`
    );
  }
};

export const payuFailure = (req, res) => {
  return res.redirect(
    `${process.env.FRONTEND_URL}/payment-failed`
  );
};