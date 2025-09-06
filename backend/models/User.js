// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  picture: {
    type: String,
  },
  googleId: {
    type: String,
    sparse:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  phone: {
    type: Number,
  },
  likedMovies: [
    {
      movieId: { type: mongoose.Schema.Types.ObjectId, ref: "movies" },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  watchLater: [
    {
      movieId: { type: mongoose.Schema.Types.ObjectId, ref: "movies" },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  purchased: [
    {
      movieId: { type: mongoose.Schema.Types.ObjectId, ref: "movies" },
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("User", userSchema);
