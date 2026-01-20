import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import connectDB from './configs/mongodb.js';
import connectCloudinay from './configs/cloudinary.js';

import { clerkWebhooks, payuWebhook, razorpayWebhook } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import payuRoutes from "./routes/payuRoutes.js";

import { clerkMiddleware } from '@clerk/express';

const __dirname = path.resolve();
const app = express();

await connectDB();
await connectCloudinay();

app.use(cors());


app.use("/api/payu", payuRoutes);

app.get('/api/webhooks/razorpay', (req, res) => {
  res.status(200).send('Razorpay webhook endpoint is live');
});

app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);
// With this
app.use(express.urlencoded({ extended: true })); // add this near the top
app.post('/api/webhooks/payu', payuWebhook);

app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Edemy API is working fine!');
});




app.post('/clerk', express.json(), clerkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

app.get("/api/logs/payu", (req, res) => {
  const logPath = path.join(process.cwd(), 'logs', "payu-callback-log.txt");

  if (!fs.existsSync(logPath)) {
    return res.status(404).send("PayU log file not found");
  }

  res.setHeader("Content-Type", "text/plain");
  res.send(fs.readFileSync(logPath, "utf8"));
});

app.get('/api/logs/razorpay', (req, res) => {
  const logPath = path.join(process.cwd(), 'logs', 'razorpay-webhook.log.txt');

  if (!fs.existsSync(logPath)) {
    return res.status(404).send('Log file not found');
  }

  res.setHeader('Content-Type', 'text/plain');
  res.send(fs.readFileSync(logPath, 'utf8'));
});
app.get('/api/logs/razorpay-payment', (req, res) => {
  const logPath = path.join(process.cwd(), 'logs', 'razorpay-webhook.txt');

  if (!fs.existsSync(logPath)) {
    return res.status(404).send('Log file not found');
  }

  res.setHeader('Content-Type', 'text/plain');
  res.send(fs.readFileSync(logPath, 'utf8'));
});
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'client', 'dist');

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});