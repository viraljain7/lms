import express from "express";
import { payuSuccess, payuFailure } from "../controllers/payuController.js";

const router = express.Router();

router.post("/success", payuSuccess);
router.post("/failure", payuFailure);

export default router;