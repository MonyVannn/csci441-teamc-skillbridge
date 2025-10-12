"use client";

import { useAuth, useUser } from "@clerk/nextjs";

/**
 * Custom hook to check if user is authenticated
 * This wraps Clerk's authentication hooks for easy reuse
 */
export const useUserAuth = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return {
    isAuthenticated: isSignedIn ?? false,
    isLoading: !isLoaded,
    user: user,
    userId: user?.id,
  };
};

