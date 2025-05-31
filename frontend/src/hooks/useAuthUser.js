import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  // Fallback mock user if the query fails or is loading
  const mockUser = {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    profilePic: 'https://via.placeholder.com/150',
  };

  return { authUser: data?.user || mockUser, isLoading, error };
};

export default useAuthUser;
