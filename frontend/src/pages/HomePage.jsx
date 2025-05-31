import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendRequests,
} from "../lib/api";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests, isLoading: loadingFriendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
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

  return (
    <div className="p-6 sm:p-10 lg:p-16 bg-gradient-to-br from-white via-blue-50 to-blue-100 min-h-screen">
      <div className="container mx-auto space-y-12">
        {/* DASHBOARD HEADER */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 text-blue-900">Welcome back!</h1>
              <p className="text-base-content opacity-70 text-lg">Here's your language learning dashboard.</p>
            </div>
            <div className="flex gap-6 mt-6 md:mt-0">
              <div className="card bg-white shadow-lg px-8 py-5 flex flex-col items-center border border-blue-100 group relative w-40 text-center">
                <span className="font-bold text-2xl text-blue-700">{friends.length}</span>
                <span className="text-xs opacity-70">Current Friends</span>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-800 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Your current friend connections
                </div>
              </div>
              <div className="card bg-white shadow-lg px-8 py-5 flex flex-col items-center border border-blue-100 group relative w-40 text-center">
                <span className="font-bold text-2xl text-blue-700">{outgoingFriendReqs?.length || 0}</span>
                <span className="text-xs opacity-70">Sent Requests</span>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-800 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Friend requests you've sent
                </div>
              </div>
              <div className="card bg-white shadow-lg px-8 py-5 flex flex-col items-center border border-blue-100 group relative w-40 text-center">
                <span className="font-bold text-2xl text-blue-700">{recommendedUsers.length}</span>
                <span className="text-xs opacity-70">Friend Suggestions</span>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-800 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  New people you can connect with
                </div>
              </div>
              <div className="card bg-white shadow-lg px-8 py-5 flex flex-col items-center border border-blue-100 group relative w-40 text-center">
                <span className="font-bold text-2xl text-blue-700">{friendRequests?.incomingReqs?.length || 0}</span>
                <span className="text-xs opacity-70">Received Requests</span>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-800 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Friend requests you have received
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FRIENDS SECTION */}
        <div className="card bg-white shadow-xl p-8 border border-blue-100 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-4 text-blue-800">
              <UsersIcon className="size-8 text-blue-400" /> Your Friends
            </h2>
            <Link to="/notifications" className="btn btn-outline btn-lg flex items-center gap-2">
              <UsersIcon className="mr-2 size-5" />
              Friend Requests
            </Link>
          </div>
          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS SECTION */}
        <div className="card bg-white shadow-xl p-6 border border-blue-100">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Suggested Friends</h2>
                <p className="opacity-70 text-sm">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-100 p-4 text-center">
              <h3 className="font-semibold text-base mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70 text-sm">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="card bg-base-100 hover:shadow-lg transition-all duration-300 border border-base-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img
                            src={user.profilePic || "https://via.placeholder.com/100?text=Avatar"}
                            alt={user.fullName}
                            onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100?text=Avatar"; }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>
                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className="footer p-10 bg-base-200 text-base-content mt-12">
        <nav>
          <h6 className="footer-title">About</h6>
          <a className="link link-hover">About Us</a>
          <a className="link link-hover">Careers</a>
          <a className="link link-hover">Press Kit</a>
        </nav>
        <nav>
          <h6 className="footer-title">Legal</h6>
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">Privacy policy</a>
          <a className="link link-hover">Cookie policy</a>
        </nav>
        <nav>
          <h6 className="footer-title">Stay Updated</h6>
          <div className="form-control w-full max-w-xs">
            <div className="join">
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered join-item w-full"
              />
              <button className="btn btn-primary join-item">Subscribe</button>
            </div>
            <p className="text-sm opacity-70 mt-2">Get notified about new messages and friend requests</p>
          </div>
        </nav>
      </footer>
      {/* COPYRIGHT SECTION */}
      <div className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>Copyright © 2023 - All right reserved by Your Company Name</p>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
