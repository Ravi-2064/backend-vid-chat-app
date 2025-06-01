import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// Get user profile
export async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get recommended users
export async function getRecommendedUsers(req, res) {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
      friends: { $ne: req.user.id }
    })
    .select("fullName profilePic nativeLanguage learningLanguage")
    .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get my friends
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Send friend request
export async function sendFriendRequest(req, res) {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: req.user.id,
      recipient: id,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.user.id,
      recipient: id,
      status: "pending"
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Accept friend request
export async function acceptFriendRequest(req, res) {
  try {
    const { id } = req.params;
    
    const friendRequest = await FriendRequest.findOne({
      _id: id,
      recipient: req.user.id,
      status: "pending"
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { friends: friendRequest.sender }
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $push: { friends: req.user.id }
    });

    res.status(200).json(friendRequest);
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get friend requests
export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending"
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(incomingReqs);
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get outgoing friend requests
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending"
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingReqs);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
