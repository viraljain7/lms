import Stripe from "stripe";
import Razorpay from "razorpay";
import CryptoJS from "crypto-js";

import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { CourseProgress } from "../models/CourseProgress.js";

/* ================= GET USER DATA ================= */

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found!" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER ENROLLED COURSES ================= */

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userData = await User.findById(userId).populate("enrolledCourses");
    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= STRIPE PURCHASE ================= */

export const purchaseCourseStripe = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const amount = (
      course.coursePrice -
      (course.discount * course.coursePrice) / 100
    ).toFixed(2);

    const purchase = await Purchase.create({
      courseId,
      userId,
      amount,
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: course.courseTitle },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { purchaseId: purchase._id.toString() },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= RAZORPAY ================= */

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const purchaseCourseRazorpay = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const amount = (
      course.coursePrice -
      (course.discount * course.coursePrice) / 100
    ).toFixed(2);

    const purchase = await Purchase.create({
      courseId,
      userId,
      amount,
      status: "pending",
      gateway: "RAZORPAY",
    });

    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${purchase._id}`,
      notes: { purchaseId: purchase._id.toString() },
    });

    res.json({
      success: true,
      razorpaySession: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        redirectUrl: `${origin}/loading/my-enrollments`,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= PAYU ================= */
// ================= PAYU =================

export const purchaseCoursePayu = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const amount = (
      course.coursePrice -
      (course.discount * course.coursePrice) / 100
    ).toFixed(2);

    const purchase = await Purchase.create({
      courseId,
      userId,
      amount,
      status: "pending",
      gateway: "PAYU",
    });

    const txnid = `TXN_${purchase._id}`;
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    const productinfo = course.courseTitle;
    const firstname = user.name || "User";
    const email = user.email;

    // ✅ CORRECT HASH STRING (DO NOT CHANGE ORDER)
    const hashString =
      `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|` +
      `${purchase._id}||||||${salt}`;

    const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);

    res.json({
      success: true,
      payuSession: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone: user.phone || "9999999999",
        udf1: purchase._id.toString(),
        surl: `${origin}/loading/my-enrollments`,
        furl: `${origin}/payment-failed`,
        hash,
        action: "https://secure.payu.in/_payment", // LIVE
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


/* ================= COURSE PROGRESS ================= */

export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    } else if (!progress.lectureCompleted.includes(lectureId)) {
      progress.lectureCompleted.push(lectureId);
      await progress.save();
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ================= USER RATING ================= */

export const addUserRating = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid rating" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "Course not purchased" });
    }

    const index = course.courseRatings.findIndex(r => r.userId === userId);
    if (index > -1) {
      course.courseRatings[index].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();
    res.json({ success: true, message: "Rating Added" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};