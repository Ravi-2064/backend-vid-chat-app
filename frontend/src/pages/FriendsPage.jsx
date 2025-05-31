import { useState } from 'react';
import { UsersIcon, UserPlusIcon, UserCheckIcon } from 'lucide-react';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Friends</h1>
        <p className="text-lg text-blue-700">Manage your connections and friend requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-blue-100">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <UsersIcon className="inline-block mr-2" />
          My Friends
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <UserPlusIcon className="inline-block mr-2" />
          Friend Requests
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeTab === 'friends' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Friend Card */}
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <UserCheckIcon className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">John Doe</h3>
                  <p className="text-sm text-blue-600">Online</p>
                </div>
                <button className="btn btn-primary btn-sm">
                  Message
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Friend Request Card */}
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                  <UserPlusIcon className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Jane Smith</h3>
                  <p className="text-sm text-blue-600">Wants to connect</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm">
                    Accept
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;