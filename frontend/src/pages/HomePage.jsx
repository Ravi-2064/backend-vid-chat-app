import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendRequests,
  getAuthUser,
  updateActivityStats
} from "../lib/api";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, ShipWheelIcon, HomeIcon, User, Settings, Activity, MessageSquare, Clock, BookOpen } from "lucide-react";
import { capitialize } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import Navbar from "../components/Navbar";
import SignupOverlay from "../components/SignupOverlay";
import Logo from "../components/Logo";
import UserSettings from '../components/UserSettings';
import HamburgerMenu from '../components/HamburgerMenu';
import useLogout from '../hooks/useLogout';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FaHeart, FaComment, FaShare, FaVideo, FaUserFriends, FaCog, FaSync } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [showSignupOverlay, setShowSignupOverlay] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { mutate: logout } = useLogout();
  const { user } = useAuth();
  const { socket, isConnected, reconnect } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user
  const { data: authData, error: authError } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: 1
  });

  const currentUser = authData?.user;

  const { data: friends = [], isLoading: loadingFriends, error: friendsError } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!currentUser
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
    enabled: !!currentUser
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    enabled: !!currentUser
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!currentUser
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  // Update activity stats mutation
  const { mutate: updateStatsMutation } = useMutation({
    mutationFn: updateActivityStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Update activity stats periodically
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        updateStatsMutation({
          friendsCount: friends.length,
          messagesCount: currentUser.messagesCount || 0,
          practiceHours: currentUser.practiceHours || 0
        });
      }, 300000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [currentUser, friends.length, updateStatsMutation]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to like post');
      
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: [...post.likes, user._id] }
          : post
      ));
      toast.success('Post liked successfully');
    } catch (error) {
      toast.error('Failed to like post');
      console.error('Error liking post:', error);
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-error">Authentication Error</h1>
          <p className="mb-4">{authError.message}</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="font-bold">Connection Lost</p>
              <p className="ml-2">You are currently offline</p>
            </div>
            <button
              onClick={reconnect}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              <FaSync className="mr-2" />
              Reconnect
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Connect with friends, share your moments, and start streaming together
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/chat"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Chatting
              </Link>
              <Link
                to="/video-chat"
                className="bg-transparent border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200"
              >
                Video Chat
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/friends"
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <FaUserFriends className="text-purple-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-purple-600">Friends List</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <FaComment className="text-purple-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-purple-600">Chat</span>
                </Link>
                <Link
                  to="/video-chat"
                  className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <FaVideo className="text-purple-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-purple-600">Video Chat</span>
                </Link>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Your Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaUserFriends className="text-purple-600" />
                    <span className="text-gray-700">Friends</span>
                  </div>
                  <span className="font-semibold text-gray-900">{friends.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaComment className="text-purple-600" />
                    <span className="text-gray-700">Messages</span>
                  </div>
                  <span className="font-semibold text-gray-900">{currentUser?.messagesCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaVideo className="text-purple-600" />
                    <span className="text-gray-700">Practice Hours</span>
                  </div>
                  <span className="font-semibold text-gray-900">{currentUser?.practiceHours || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Posts Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Posts</h2>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post._id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={`https://ui-avatars.com/api/?name=${post.author.name}&background=random`}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all duration-200"
                        >
                          <FaHeart className={post.likes.includes(user._id) ? 'text-red-500' : ''} />
                          <span>{post.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all duration-200">
                          <FaComment />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all duration-200">
                          <FaShare />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No posts yet. Be the first to share something!
                </div>
              )}
            </div>

            {/* Recommended Friends */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Recommended Friends</h2>
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : recommendedUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={outgoingRequestsIds.has(user._id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          outgoingRequestsIds.has(user._id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {outgoingRequestsIds.has(user._id) ? 'Request Sent' : 'Add Friend'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recommended friends at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
