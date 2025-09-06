import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import userRoutes from "./routes/user.js";
import paymentRoutes from "./routes/payment.js";
import cors from "cors";
import { Movies } from "./models/Movies.js";

import Razorpay from "razorpay";
export const instance  = new Razorpay({
  key_id:process.env.RAZORPAY_API_KEY,
  key_secret:process.env.RAZORPAY_API_SECRET
})

const connurl = process.env.MONGO_URI;

let conn = await mongoose.connect(connurl);

// const newMovie = new Movies({
//   title: "Captain America:Civil War",
//   year: "2023",
//   poster: "https://images5.alphacoders.com/689/thumb-1920-689398.jpg",
//   fullplot:
//     "Political involvement in the Avengers' affairs causes a rift between Captain America and Iron Man..",
//   imdb: { rating: 7, votes: 646, id: 11293 },
//   genres: ["Action", "Thriller"],
// });

// newMovie
//   .save()
//   .then(() => {
//     console.log("Movie added successfully!");
//     mongoose.connection.close();
//   })
//   .catch((err) => console.error("Error adding movie:", err));

const app = express();
const port = process.env.PORT || 5000; // Use available port in deployment

// Add this to handle OPTIONS requests for CORS preflight
app.use(cors());
app.use(express.json()); // Middleware used to use req.body so that we can send request in json
app.use(express.urlencoded({extended:true}));

// //Available Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/api/getkey",async(req,res)=>
  await res.status(200).json({key:process.env.RAZORPAY_API_KEY}));

app.listen(port, () => {
  console.log(`MovieWebsite backend listening on port ${port}`);
});
