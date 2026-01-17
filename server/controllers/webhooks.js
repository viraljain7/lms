// import { Webhook } from "svix";
// import User from "../models/User.js";

// // Api controller function to manage clerk user with databse

// export const clerkWebhooks = async (req,res)=>{

//     try {
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
//         await whook.verify(JSON.stringify(req.body),{
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"]
//         })

//         const {data, type} = req.body

//         switch (type) {
//             case 'user.created':{
//                 const userData = {
//                     _id: data.id,
//                     email:data.email_addresses[0].email_address,
//                     name: data.first_name + " " + data.last_name,
//                     imageUrl: data.image_url,
//                 }
//                 await User.create(userData)
//                 res.json({})
//                 break;
//             }
                
//                 case 'user.updated':{
//                     const userData = {
//                         email:data.email_address[0].email_address,
//                         name: data.first_name + " " + data.last_name,
//                         imageUrl: data.image_url,
//                     }
//                     await User.findByIdAndUpdate(data.id, userData)
//                     res.json({})
//                     break;
//                 }

//                 case 'user.deleted': {
//                     await User.findByIdAndDelete(data.id);
//                     res.json({})
//                     break;
//                 }
        
//             default:
//                 break;
//         }

//     } catch (error) {
//         res.json({success: false, message: error.message})
//     }

// }

import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";


import crypto from "crypto";
import Razorpay from "razorpay";


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




// export const stripeWebhooks = async (request,response) => {
//     const sig = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   }
//   catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//   }
//     // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':{
//       const paymentIntent = event.data.object;
//       const paymentIntentId = paymentIntent.id;
//       const session = await stripeInstance.checkout.sessions.list({
//         payment_intent: paymentIntentId
//       })
//       const {purchaseId} = session.data[0].metadata;
//       const purchaseData = await Purchase.findById(purchaseId)

//       const userData = await User.findById(purchaseData.userId)
//       const courseData = await Course.findById(purchaseData.courseId.toString())

//       courseData.enrolledStudents.push(userData)
//       await courseData.save()

//       userData.enrolledCourses.push(courseData._id)
//       await userData.save()

//       purchaseData.status = 'completed'

//       await purchaseData.save()

//       break;
//     }


//     case 'payment_intent.payment_failed':{
//         const paymentIntent = event.data.object;
//         const paymentIntentId = paymentIntent.id;
//         const session = await stripeInstance.checkout.sessions.list({
//           payment_intent: paymentIntentId
//         })
//         const {purchaseId} = session.data[0].metadata;
//         const purchaseData = await Purchase.findById(purchaseId)

//         purchaseData.status = 'failed'
//         await purchaseData.save();
      
//       break;
//     }
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   response.json({received: true});
// }


// import Stripe from 'stripe';

// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const stripeWebhooks = async (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     } catch (err) {
//         return response.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     const handlePaymentSuccess = async (paymentIntent) => {
//         try {
//             const paymentIntentId = paymentIntent.id;
//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
//             });

//             if (!session.data.length) {
//                 console.error("No session data found for payment intent:", paymentIntentId);
//                 return;
//             }

//             const { purchaseId } = session.data[0].metadata;
//             const purchaseData = await Purchase.findById(purchaseId);

//             if (!purchaseData) {
//                 console.error("No purchase found for ID:", purchaseId);
//                 return;
//             }

//             const userData = await User.findById(purchaseData.userId);
//             const courseData = await Course.findById(purchaseData.courseId.toString());

//             if (!userData || !courseData) {
//                 console.error("User or Course not found");
//                 return;
//             }

//             // Add user to enrolled students
//             courseData.enrolledStudents.push(userData._id);
//             await courseData.save();

//             // Add course to user's enrolled courses
//             userData.enrolledCourses.push(courseData._id);
//             await userData.save();

//             // Update purchase status
//             purchaseData.status = 'completed';
//             await purchaseData.save();
//         } catch (error) {
//             console.error("Error handling payment success:", error);
//         }
//     };

//     const handlePaymentFailed = async (paymentIntent) => {
//         try {
//             const paymentIntentId = paymentIntent.id;
//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
//             });

//             if (!session.data.length) {
//                 console.error("No session data found for failed payment intent:", paymentIntentId);
//                 return;
//             }

//             const { purchaseId } = session.data[0].metadata;
//             const purchaseData = await Purchase.findById(purchaseId);

//             if (!purchaseData) {
//                 console.error("No purchase found for ID:", purchaseId);
//                 return;
//             }

//             purchaseData.status = 'failed';
//             await purchaseData.save();
//         } catch (error) {
//             console.error("Error handling payment failure:", error);
//         }
//     };

//     switch (event.type) {
//         case 'payment_intent.succeeded':
//             await handlePaymentSuccess(event.data.object);
//             break;

//         case 'payment_intent.payment_failed':
//             await handlePaymentFailed(event.data.object);
//             break;

//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a response to acknowledge receipt of the event
//     response.json({ received: true });
// };


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const razorpayWebhook = async (req, res) => {
      console.log("🔥 RAZORPAY WEBHOOK HIT");

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  // 🔐 Verify Signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = JSON.parse(req.body.toString());

  // ✅ PAYMENT SUCCESS
 const handlePaymentSuccess = async (payment) => {
  try {
    const orderId = payment.order_id;

    const order = await razorpayInstance.orders.fetch(orderId);
    const { purchaseId } = order.notes;

    if (!purchaseId) {
      console.log("❌ purchaseId missing in order.notes");
      return;
    }

    const purchaseData = await Purchase.findById(purchaseId);
    if (!purchaseData) return;

    if (purchaseData.status === "completed") return; // idempotent

    const userData = await User.findById(purchaseData.userId);
    const courseData = await Course.findById(purchaseData.courseId);

    if (!userData || !courseData) return;

    if (!courseData.enrolledStudents.includes(userData._id)) {
      courseData.enrolledStudents.push(userData._id);
      await courseData.save();
    }

    if (!userData.enrolledCourses.includes(courseData._id)) {
      userData.enrolledCourses.push(courseData._id);
      await userData.save();
    }

    purchaseData.status = "completed";
    purchaseData.paymentId = payment.id;
    await purchaseData.save();

    console.log("✅ Razorpay payment processed successfully");

  } catch (err) {
    console.error("Razorpay success error:", err);
  }
};


  // ❌ PAYMENT FAILED
  const handlePaymentFailed = async (payment) => {
    try {
      const { purchaseId } = payment.notes;

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) return;

      purchaseData.status = "failed";
      purchaseData.paymentId = payment.id;
      await purchaseData.save();

    } catch (err) {
      console.error("Razorpay failure error:", err);
    }
  };
  // 🔁 Event Switch
  console.log(event.event);
switch (event.event) {
  case "payment.captured":
  case "order.paid":
    await handlePaymentSuccess(event.payload.payment.entity);
    break;

  case "payment.failed":
    await handlePaymentFailed(event.payload.payment.entity);
    break;

  default:
    console.log("Unhandled Razorpay event:", event.event);
}


  res.json({ status: "ok" });
    // Return a response to acknowledge receipt of the event
    // response.json({ received: true });
};

