import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // Enable sending cookies
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error);
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
);

// Helper function to handle API requests
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Authentication API calls
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    const data = response.data;
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Store auth data in localStorage
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};

// User Profile API calls
export const getAuthUser = async () => {
  try {
    const response = await api.get("/users/profile");
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch user profile"
    };
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put("/users/profile", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

// Blog API calls
export const addBlog = async (blogData) => {
  try {
    const response = await api.post("/users/blogs", blogData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create blog");
  }
};

export const updateBlog = async (blogId, blogData) => {
  try {
    const response = await api.put(`/users/blogs/${blogId}`, blogData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update blog");
  }
};

export const deleteBlog = async (blogId) => {
  try {
    const response = await api.delete(`/users/blogs/${blogId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete blog");
  }
};

export const addBlogComment = async (blogId, commentData) => {
  try {
    const response = await api.post(`/users/blogs/${blogId}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add comment");
  }
};

export const likeBlog = async (blogId) => {
  try {
    const response = await api.post(`/users/blogs/${blogId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to like blog");
  }
};

// Activity Stats API calls
export const updateActivityStats = async (statsData) => {
  try {
    const response = await api.put("/users/activity", statsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update activity stats");
  }
};

// Friends API calls
export const getUserFriends = async () => {
  try {
    const response = await api.get('/users/friends');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching friends:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch friends'
    };
  }
};

export const getFriendRequests = async () => {
  try {
    const response = await api.get('/users/friend-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw new Error('Failed to fetch friend requests');
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const response = await api.post(`/users/friend-request/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw new Error('Failed to send friend request');
  }
};

export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await api.put(`/users/friend-request/${requestId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw new Error('Failed to accept friend request');
  }
};

export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await api.put(`/users/friend-request/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw new Error('Failed to reject friend request');
  }
};

export const getOutgoingFriendReqs = async () => {
  try {
    const response = await api.get('/users/outgoing-friend-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching outgoing friend requests:', error);
    throw new Error('Failed to fetch outgoing friend requests');
  }
};

export const getRecommendedUsers = async () => {
  try {
    const response = await api.get("/users");
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching recommended users:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch recommended users"
    };
  }
};

// Mock data for development
const mockUsers = [
  {
    _id: "user1",
    email: "alex@streamify.com",
    password: "password123",
    fullName: "Alex Thompson",
    profilePic: "https://i.pravatar.cc/150?img=1",
    backgroundImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    location: "New York, USA",
    bio: "Language enthusiast and avid traveler. Learning Spanish and French.",
    nativeLanguage: "english",
    learningLanguage: "spanish",
    friends: ["user2"],
    hobbies: ["Travel", "Music", "Cooking"],
    blogs: [
      {
        id: "1",
        title: "My Language Learning Journey",
        content: "Started learning Spanish 6 months ago...",
        date: new Date().toISOString(),
        likes: 5,
        comments: []
      }
    ],
    activityStats: {
      friendsCount: 1,
      messagesCount: 15,
      practiceHours: 25
    },
    interests: ["Travel", "Music", "Cooking"],
    achievements: ["10 Day Streak", "First Conversation"]
  },
  {
    _id: "user2",
    email: "maria@example.com",
    password: "password123",
    fullName: "Maria Garcia",
    profilePic: "https://i.pravatar.cc/150?img=2",
    backgroundImage: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
    location: "Madrid, Spain",
    bio: "Spanish teacher and language exchange partner. Love helping others learn!",
    nativeLanguage: "spanish",
    learningLanguage: "english",
    friends: ["user1"],
    hobbies: ["Teaching", "Dancing", "Reading"],
    blogs: [
      {
        id: "2",
        title: "Tips for Learning Spanish",
        content: "Here are my top tips for learning Spanish...",
        date: new Date().toISOString(),
        likes: 8,
        comments: []
      }
    ],
    activityStats: {
      friendsCount: 1,
      messagesCount: 15,
      practiceHours: 30
    },
    interests: ["Teaching", "Dancing", "Reading"],
    achievements: ["Top Contributor", "Language Mentor"]
  }
];

// Mock API functions for development
export const mockLogin = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Store user in localStorage
  localStorage.setItem("user", JSON.stringify(user));
  return { user, token: "mock-token" };
};

export const mockGetAuthUser = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
};

export const mockUpdateUserProfile = async (profileData) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    throw new Error("Not authenticated");
  }

  const updatedUser = { ...user, ...profileData };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  return updatedUser;
};

export const mockAddBlog = async (blogData) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    throw new Error("Not authenticated");
  }

  const newBlog = {
    id: Date.now().toString(),
    ...blogData,
    date: new Date().toISOString(),
    likes: 0,
    comments: []
  };

  user.blogs = [...(user.blogs || []), newBlog];
  localStorage.setItem("user", JSON.stringify(user));
  return newBlog;
};

export const mockUpdateActivityStats = async (statsData) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    throw new Error("Not authenticated");
  }

  user.activityStats = { ...user.activityStats, ...statsData };
  localStorage.setItem("user", JSON.stringify(user));
  return user.activityStats;
};

// Chat API calls
export const getMessages = async (roomId) => {
  try {
    const response = await api.get(`/chat/messages/${roomId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch messages");
  }
};

export const sendMessage = async (roomId, message) => {
  try {
    const response = await api.post("/chat/messages", { roomId, message });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
};

export const uploadFile = async (roomId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/chat/rooms/${roomId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to upload file");
  }
};

// Chat Room API calls
export const getRoomParticipants = async (roomId) => {
  try {
    const response = await api.get(`/chat/rooms/${roomId}/participants`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch room participants");
  }
};

export const joinRoom = async (roomId) => {
  try {
    const response = await api.post(`/chat/rooms/${roomId}/join`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to join room");
  }
};

export const leaveRoom = async (roomId) => {
  try {
    const response = await api.post(`/chat/rooms/${roomId}/leave`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to leave room");
  }
};

export const removeParticipant = async (roomId, participantId) => {
  try {
    const response = await api.delete(`/chat/rooms/${roomId}/participants/${participantId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to remove participant");
  }
};

// Posts API calls
export const getLatestPosts = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await api.get('/posts/latest');
    return response.data;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch latest posts');
  }
};
