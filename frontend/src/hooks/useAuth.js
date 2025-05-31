import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthUser, logout as logoutApi } from '../lib/api';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const logout = async () => {
    await logoutApi();
    queryClient.clear();
  };

  return {
    authUser: authUser?.user || null,
    isLoading,
    logout,
  };
}; 