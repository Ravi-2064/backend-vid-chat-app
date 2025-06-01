import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendRequests,
  getAuthUser,
  updateActivityStats,
  getLatestPosts
} from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
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
import { FaHeart, FaComment, FaShare, FaVideo, FaUserFriends, FaCog, FaSync, FaBell, FaSearch, FaPlus, FaBolt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [showSignupOverlay, setShowSignupOverlay] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { mutate: logout } = useLogout();
  const { user, loading: authLoading } = useAuth();
  const { socket, isConnected, reconnect } = useSocket();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get current user
  const { data: authData, error: authError } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: 1,
    enabled: !!user // Only run if user is authenticated
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

  // Add new query for latest posts
  const { data: latestPosts = [], isLoading: loadingPosts, error: postsError } = useQuery({
    queryKey: ["latestPosts"],
    queryFn: getLatestPosts,
    enabled: !!user && !!currentUser // Only run if user is authenticated and currentUser is loaded
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userData = await getAuthUser();
        if (!userData.success) {
          throw new Error(userData.message || 'Failed to fetch user data');
        }

        // Fetch recommended users
        const recommendedData = await getRecommendedUsers();
        if (!recommendedData.success) {
          throw new Error(recommendedData.message || 'Failed to fetch recommended users');
        }

        // Set posts from latest posts query
        if (latestPosts) {
          setPosts(latestPosts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        toast.error(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, latestPosts]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new posts
    socket.on('newPost', (post) => {
      setPosts(prev => [post, ...prev]);
    });

    // Listen for post updates
    socket.on('postUpdated', (updatedPost) => {
      setPosts(prev => prev.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      ));
    });

    return () => {
      socket.off('newPost');
      socket.off('postUpdated');
    };
  }, [socket]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
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
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Welcome back, {user.name}! 👋
                </h1>
                <p className="text-xl text-purple-100">
                  Connect with friends, share your moments, and start streaming together
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/chat"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FaComment />
                Start Chatting
              </Link>
              <Link
                to="/video-chat"
                className="bg-transparent border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 flex items-center gap-2"
              >
                <FaVideo />
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
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <FaBolt className="text-yellow-500" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/friends"
                  className="flex items-center gap-3 p-4 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <FaUserFriends className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <span className="text-gray-700 group-hover:text-purple-600 font-medium">Friends List</span>
                    <p className="text-sm text-gray-500">Connect with your friends</p>
                  </div>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center gap-3 p-4 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <FaComment className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <span className="text-gray-700 group-hover:text-purple-600 font-medium">Chat</span>
                    <p className="text-sm text-gray-500">Start a conversation</p>
                  </div>
                </Link>
                <Link
                  to="/video-chat"
                  className="flex items-center gap-3 p-4 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-200">
                    <FaVideo className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <span className="text-gray-700 group-hover:text-purple-600 font-medium">Video Chat</span>
                    <p className="text-sm text-gray-500">Start a video call</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <Activity className="text-purple-600" />
                Your Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaUserFriends className="text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-700">Friends</span>
                      <p className="text-sm text-gray-500">Total connections</p>
                    </div>
                  </div>
                  <span className="font-bold text-2xl text-purple-600">{friends.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaComment className="text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-700">Messages</span>
                      <p className="text-sm text-gray-500">Total sent</p>
                    </div>
                  </div>
                  <span className="font-bold text-2xl text-purple-600">{currentUser?.messagesCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaVideo className="text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-700">Practice Hours</span>
                      <p className="text-sm text-gray-500">Total time</p>
                    </div>
                  </div>
                  <span className="font-bold text-2xl text-purple-600">{currentUser?.practiceHours || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200">
                  <FaPlus />
                </button>
              </div>
            </div>

            {/* Latest Posts Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <FaComment className="text-purple-600" />
                Latest Posts
              </h2>
              {loadingPosts ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : latestPosts.length > 0 ? (
                <div className="space-y-6">
                  {latestPosts.map((post) => (
                    <div key={post._id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={`https://ui-avatars.com/api/?name=${post.author.name}&background=random`}
                          alt={post.author.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 text-lg">{post.content}</p>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all duration-200"
                        >
                          <FaHeart className={`text-xl ${post.likes.includes(user._id) ? 'text-red-500' : ''}`} />
                          <span>{post.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all duration-200">
                          <FaComment className="text-xl" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-all duration-200">
                          <FaShare className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaComment className="text-4xl mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </div>

            {/* Recommended Friends */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <FaUserFriends className="text-purple-600" />
                Recommended Friends
              </h2>
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : recommendedUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                          alt={user.name}
                          className="w-12 h-12 rounded-full"
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
                  <FaUserFriends className="text-4xl mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No recommended friends at the moment.</p>
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
