import { useState } from 'react';
import { UsersIcon, UserPlusIcon, UserCheckIcon, Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserFriends, getFriendRequests, acceptFriendRequest } from '../lib/api';
import FriendCard from '../components/FriendCard';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: friendRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const acceptRequestMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const handleAcceptRequest = (requestId) => {
    acceptRequestMutation.mutate(requestId);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Friends</h1>
        <p className="text-lg text-base-content opacity-70">Manage your connections and friend requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-base-300">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-primary border-b-2 border-primary'
              : 'text-base-content opacity-70 hover:text-primary'
          }`}
        >
          <UsersIcon className="inline-block mr-2" />
          My Friends
          {friends.length > 0 && (
            <span className="ml-2 badge badge-primary badge-sm">{friends.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'requests'
              ? 'text-primary border-b-2 border-primary'
              : 'text-base-content opacity-70 hover:text-primary'
          }`}
        >
          <Bell className="inline-block mr-2" />
          Friend Requests
          {friendRequests?.incomingReqs?.length > 0 && (
            <span className="ml-2 badge badge-primary badge-sm">{friendRequests.incomingReqs.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="card bg-base-100 shadow-xl p-6 border border-base-300">
        {activeTab === 'friends' ? (
          <div className="space-y-6">
            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base-content opacity-70">No friends yet. Start connecting with others!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friendRequests?.incomingReqs?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base-content opacity-70">No pending friend requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendRequests?.incomingReqs?.map((request) => (
                  <div key={request._id} className="card bg-base-100 shadow-lg p-4 border border-base-300">
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                          <img
                            src={request.sender.profilePic || "https://via.placeholder.com/150"}
                            alt={request.sender.fullName}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">{request.sender.fullName}</h3>
                        <p className="text-sm text-base-content opacity-70">
                          {request.sender.nativeLanguage} native
                        </p>
                        <p className="text-xs text-base-content opacity-50">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(request._id)}
                          className="btn btn-primary btn-sm"
                          disabled={acceptRequestMutation.isPending}
                        >
                          {acceptRequestMutation.isPending ? 'Accepting...' : 'Accept'}
                        </button>
                        <button className="btn btn-ghost btn-sm">Decline</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;