import { axiosInstance } from "./axios";
import axios from "axios";

// Mock data
const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  profilePic: 'https://avatar.iran.liara.run/public/1.png',
  nativeLanguage: 'english',
  learningLanguage: 'spanish',
  location: 'New York, USA',
  bio: 'Just a demo user exploring the app!',
};

const mockFriends = [
  {
    _id: '2',
    fullName: 'John Doe',
    email: 'john@example.com',
    profilePic: 'https://avatar.iran.liara.run/public/2.png',
    nativeLanguage: 'spanish',
    learningLanguage: 'english',
    location: 'Madrid, Spain',
    bio: 'Hola!',
  },
  {
    _id: '3',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    profilePic: 'https://avatar.iran.liara.run/public/3.png',
    nativeLanguage: 'french',
    learningLanguage: 'english',
    location: 'Paris, France',
    bio: 'Bonjour!',
  },
];

const mockRecommendedUsers = [
  {
    _id: '4',
    fullName: 'Mike Johnson',
    email: 'mike@example.com',
    profilePic: 'https://avatar.iran.liara.run/public/4.png',
    nativeLanguage: 'german',
    learningLanguage: 'english',
    location: 'Berlin, Germany',
    bio: 'Hallo!',
  },
  {
    _id: '5',
    fullName: 'Sarah Wilson',
    email: 'sarah@example.com',
    profilePic: 'https://avatar.iran.liara.run/public/5.png',
    nativeLanguage: 'italian',
    learningLanguage: 'english',
    location: 'Rome, Italy',
    bio: 'Ciao!',
  },
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Actual API calls
export const signup = async (signupData) => {
  const response = await axios.post('/api/auth/signup', signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axios.post('/api/auth/login', loginData);
  return response.data;
};

export const logout = async () => {
  await delay(500);
  return { success: true };
};

export const getAuthUser = async () => {
  await delay(500);
  // Return mockUser if a mock token exists in local storage or similar
  // For now, just return the user directly
  return { user: mockUser };
};

export async function getUserFriends() {
  await delay(500);
  return mockFriends;
}

export async function getRecommendedUsers() {
  await delay(500);
  return mockRecommendedUsers;
}

export async function getOutgoingFriendReqs() {
  await delay(500);
  return [];
}

export async function sendFriendRequest(userId) {
  await delay(500);
  return { success: true };
}

export async function getFriendRequests() {
  await delay(500);
  return {
    incomingReqs: [
      {
        _id: '6',
        sender: {
          _id: '6',
          fullName: 'Alex Brown',
          email: 'alex@example.com',
          profilePic: 'https://via.placeholder.com/150',
          nativeLanguage: 'english',
          learningLanguage: 'mandarin',
          location: 'London, UK',
          bio: 'Ni hao!',
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ],
    acceptedReqs: [],
  };
}

export async function acceptFriendRequest(requestId) {
  await delay(500);
  return { success: true };
}

export async function getStreamToken() {
  await delay(500);
  return { token: 'mock-stream-token' };
}
