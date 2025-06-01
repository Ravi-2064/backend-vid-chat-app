import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { Post } from '../models/post.model.js';

const router = express.Router();

// Get all posts
router.get('/', protectRoute, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a new post
router.post('/', protectRoute, async (req, res) => {
  try {
    const { content } = req.body;
    const post = new Post({
      content,
      author: req.user._id
    });
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Add a comment to a post
router.post('/:postId/comments', protectRoute, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      content,
      author: req.user._id
    });
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .populate('comments.author', 'name email avatar');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', protectRoute, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .populate('comments.author', 'name email avatar');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Error liking/unliking post' });
  }
});

// Get latest posts
router.get('/latest', protectRoute, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    res.status(500).json({ message: 'Error fetching latest posts' });
  }
});

export default router; 