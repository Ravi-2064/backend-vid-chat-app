import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store the user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Force a refetch of the auth user
      queryClient.refetchQueries({ queryKey: ["authUser"] });
      
      // Navigate to home page
      navigate("/home", { replace: true });
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
