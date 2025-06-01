const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth.middleware");
const Post = require("../models/Post");

// Get all posts
router.get("/", protectRoute, async(req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "fullName profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error in get all posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new post
router.post("/", protectRoute, async(req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = new Post({
      content,
      author: req.user._id,
    });

    await post.save();
    await post.populate("author", "fullName profilePic");

    res.status(201).json(post);
  } catch (error) {
    console.error("Error in create post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add comment to a post
router.post("/:postId/comments", protectRoute, async(req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      content,
      author: req.user._id,
    });

    await post.save();
    await post.populate("author", "fullName profilePic");
    await post.populate("comments.author", "fullName profilePic");

    res.json(post);
  } catch (error) {
    console.error("Error in add comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Like/Unlike a post
router.post("/:postId/like", protectRoute, async(req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate("author", "fullName profilePic");

    res.json(post);
  } catch (error) {
    console.error("Error in like/unlike post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
