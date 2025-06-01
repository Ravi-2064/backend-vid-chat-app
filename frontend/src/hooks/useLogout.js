import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../lib/api";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries from the cache
      queryClient.clear();
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Navigate to login page
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      
      // Still clear local storage and redirect even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  });

  return { logoutMutation: mutate, isPending };
};

export default useLogout;
