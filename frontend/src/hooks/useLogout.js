import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  // Fallback mock logout function if the mutation fails
  const mockLogout = () => {
    console.log('Mock logout called');
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
  };

  return { logoutMutation: logoutMutation || mockLogout, isPending, error };
};

export default useLogout;
