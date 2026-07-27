import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 60_000,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.id,
    isAdmin: user?.isAdmin === 1,
  };
}
