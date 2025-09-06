import express from "express";
import { checkout, paymentVerification } from "../controller/paymentController.js";
const router = express.Router();

router.post("/checkout",checkout);

router.post("/paymentverification",paymentVerification);

export default router;
