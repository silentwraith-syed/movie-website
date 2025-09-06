import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { google } from "googleapis"; // Import google from googleapis package
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const client = process.env.CLIENT_URL;
const host = process.env.API_URL;

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${host.endsWith('/') ? host : host + '/'}api/auth/google/callback`;
const JWT_SECRET = process.env.JWT_SECRET;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate Google OAuth URL
router.get("/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(authUrl);
});

// Handle Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data } = await oauth2.userinfo.get();

    // Check if user exists in database
    let user = await User.findOne({ email: data.email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name: data.name,
        email: data.email,
        picture: data.picture,
        googleId: data.id,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Redirect to frontend with token
    res.redirect(`${client}auth/success?token=${token}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${client}auth/error`);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password ,phone } = req.body;

    if (!name || !email || !password || !phone)
      return res.status(400).json({ error: "All fields are required." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, phone: phone, googleId: new mongoose.Types.ObjectId().toString() });

    await newUser.save();
    res.json({ message: "User registered successfully." });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "All fields are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // Assuming JWT contains userId
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ token, user });
  } catch (error) {
    console.error("Error in /auth/me:", error);
    res.status(400).json({ error: "Invalid token" });
  }
});

export default router;