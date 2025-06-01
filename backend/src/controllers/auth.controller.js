import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Sign up a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { email, password, fullName, nativeLanguage, learningLanguage } = req.body;

    if (!email || !password || !fullName || !nativeLanguage || !learningLanguage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
      nativeLanguage,
      learningLanguage,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }
 
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ 
      success: true, 
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      console.log("Missing credentials");
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });
    console.log("User found:", !!user);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("Login successful");
    res.status(200).json({
      success: true,
      token, // Send token in response body
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        bio: user.bio,
        location: user.location,
        hobbies: user.hobbies,
        blogs: user.blogs,
        friendsCount: user.friendsCount,
        messagesCount: user.messagesCount,
        practiceHours: user.practiceHours
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Google authentication
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "No credential provided",
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      const idx = Math.floor(Math.random() * 100) + 1;
      const randomAvatar = picture || `https://avatar.iran.liara.run/public/${idx}.png`;

      user = await User.create({
        email,
        fullName: name,
        password: Math.random().toString(36).slice(-8), // Random password
        profilePic: randomAvatar,
        nativeLanguage: "English", // Default values
        learningLanguage: "Spanish",
      });

      try {
        await upsertStreamUser({
          id: user._id.toString(),
          name: user.fullName,
          image: user.profilePic || "",
        });
        console.log(`Stream user created for ${user.fullName}`);
      } catch (error) {
        console.log("Error creating Stream user:", error);
      }
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        bio: user.bio,
        location: user.location,
        hobbies: user.hobbies,
        blogs: user.blogs,
        friendsCount: user.friendsCount,
        messagesCount: user.messagesCount,
        practiceHours: user.practiceHours
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Error authenticating with Google",
      error: error.message,
    });
  }
};
