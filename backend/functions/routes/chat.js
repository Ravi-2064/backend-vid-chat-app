const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth.middleware");
const User = require("../models/User");

// Get all users for chat
router.get("/users", protectRoute, async(req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("fullName profilePic isOnline lastSeen");
    res.json(users);
  } catch (error) {
    console.error("Error in get chat users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile for chat
router.get("/users/:userId", protectRoute, async(req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("fullName profilePic isOnline lastSeen nativeLanguage learningLanguage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in get user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
