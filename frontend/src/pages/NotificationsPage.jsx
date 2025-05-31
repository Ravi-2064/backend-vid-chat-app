import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon, UserPlusIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Notifications</h1>
        <p className="text-lg text-blue-700">Stay updated with your latest activities</p>
      </div>

      <div className="space-y-6">
        {/* Friend Request Notification */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlusIcon className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">New Friend Request</h3>
              <p className="text-blue-700">Sarah Johnson wants to connect with you</p>
              <p className="text-sm text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm">Accept</button>
              <button className="btn btn-ghost btn-sm">Decline</button>
            </div>
          </div>
        </div>

        {/* Message Notification */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <MessageSquareIcon className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">New Message</h3>
              <p className="text-blue-700">Mike Brown sent you a message</p>
              <p className="text-sm text-gray-500 mt-1">5 hours ago</p>
            </div>
            <button className="btn btn-primary btn-sm">Reply</button>
          </div>
        </div>

        {/* System Notification */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <BellIcon className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">System Update</h3>
              <p className="text-blue-700">New features are now available!</p>
              <p className="text-sm text-gray-500 mt-1">1 day ago</p>
            </div>
            <button className="btn btn-ghost btn-sm">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
