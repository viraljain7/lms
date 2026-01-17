import 'dotenv/config';

import express from 'express'
import cors from 'cors'

import connectDB from './configs/mongodb.js';
import { clerkWebhooks, razorpayWebhook  } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinay from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import path from "path";


const __dirname=path.resolve();
// initialize express 
const app = express();


// connect to db
await connectDB();
await connectCloudinay();


// middleware
app.use(cors());
app.post('/stripe', express.raw({type: 'application/json'}), razorpayWebhook);
app.use(clerkMiddleware())


// Routes
app.get('/', (req,res)=>{res.send("Edemy API is working fine!")})
app.post('/clerk', express.json(), clerkWebhooks)
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);



// port
const PORT = process.env.PORT || 3000;



if (process.env.NODE_ENV === "Production") {
  const frontendPath = path.join(__dirname, "client", "dist");


  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}



app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT}`);
    
})