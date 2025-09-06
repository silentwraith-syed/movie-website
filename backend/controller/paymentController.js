import { instance } from "../index.js";
import "dotenv/config";
import crypto from "crypto";

export const checkout=async(req,res)=> {
    
    var options = {
        amount: Number(req.body.amount*100),  // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
      };
    const order = await instance.orders.create(options);
    console.log(order);

    res.status(200).json({
        success:true,
        order,
    });
};

export const paymentVerification=async(req,res)=> {
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature}= req.body;
    const {movieId}=req.query;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    var key = process.env.RAZORPAY_API_KEY;
    var secret = process.env.RAZORPAY_API_SECRET;

    console.log("key ",key);
    console.log("secret ",secret);

    const expectedSignature = crypto.createHmac('sha256',secret)
                                    .update(body.toString())
                                    .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature;
    if(isAuthentic){
        res.redirect(`${process.env.CLIENT_URL}paymentsuccess?reference=${razorpay_payment_id}&movieId=${movieId}`)
    }
    else{
        res.status(400).json({
            success:false,
        })
    }
};