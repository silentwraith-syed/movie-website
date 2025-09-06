import express from "express";
const router = express.Router();
import User from "../models/User.js";
import authMiddleWare from "../middleware/auth.js";

router.post("/watchlater/:movieId", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have user auth middleware
    const movieId = req.params.movieId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if movie is already in watch later
    const exists = user.watchLater.some(
      (item) => item.movieId.toString() === movieId
    );

    if (!exists) {
      user.watchLater.push({ movieId });
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/watchlater-rm/:movieId", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have user auth middleware
    const movieId = req.params.movieId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the movie in the watchLater array
    const movieIndex = user.watchLater.findIndex(
      (item) => item.movieId.toString() === movieId
    );

    if (movieIndex === -1) {
      return res.status(404).json({ error: "Movie not found in watch later list" });
    }

    // Remove the movie from the watchLater array
    user.watchLater.splice(movieIndex, 1);
    await user.save();

    res.json({ success: true, message: "Movie removed from watch later" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Like a movie
router.post("/like/:movieId", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId;
    const movieId = req.params.movieId;

    const user = await User.findById(userId);

    // Check if movie is already liked
    const exists = user.likedMovies.some(
      (item) => item.movieId.toString() === movieId
    );

    if (!exists) {
      user.likedMovies.push({ movieId });
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Add To Purchased movies
router.post("/purchase/:movieId", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId;
    const movieId = req.params.movieId;

    const user = await User.findById(userId);

    // Check if movie is already liked
    const exists = user.purchased.some(
      (item) => item.movieId.toString() === movieId
    );

    if (!exists) {
      user.purchased.push({ movieId });
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/like-rm/:movieId", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId; // Assuming you have user auth middleware
    const movieId = req.params.movieId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the movie in the watchLater array
    const movieIndex = user.likedMovies.findIndex(
      (item) => item.movieId.toString() === movieId
    );

    if (movieIndex === -1) {
      return res.status(404).json({ error: "Movie not found in Liked list" });
    }

    // Remove the movie from the watchLater array
    user.likedMovies.splice(movieIndex, 1);
    await user.save();

    res.json({ success: true, message: "Movie removed from liked Movies" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// Get user's watch later list
router.get("/watchlater", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate(
      "watchLater.movieId",
      "title poster year"
    ); // Only fetch needed fields

    res.json(user.watchLater);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/liked", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate(
      "likedMovies.movieId",
      "title poster year"
    ); // Only fetch needed fields

    res.json(user.likedMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/purchased", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate(
      "purchased.movieId",
      "title poster year"
    ); // Only fetch needed fields

    res.json(user.purchased);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//FindUser By token
router.get("/findUser", authMiddleWare, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
