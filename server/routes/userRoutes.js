import express from "express";
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourseStripe, purchaseCourseRazorpay, updateUserCourseProgress, userEnrolledCourses, purchaseCoursePayu } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);
userRouter.post('/purchase', purchaseCoursePayu);
// userRouter.post('/purchase', purchaseCourseRazorpay);
// userRouter.post('/purchase', purchaseCourseStripe);

userRouter.post('/update-course-progress', updateUserCourseProgress);
userRouter.post('/get-course-progress', getUserCourseProgress);
userRouter.post('/add-rating', addUserRating);

export default userRouter; 
