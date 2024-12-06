"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "@/providers/UserProvider";
import { User } from "@/schemas";
import { useUser } from "@/providers/UserProvider";

/**
 * Hook to fetch the current user's data based on userId from the context.
 * @returns A query object from React Query with the current user data, loading state, and error.
 */
export function useCurrentUser() {
    const { userId } = useUser();

    return useQuery<User | null, Error>({
        queryKey: ["currentUser", userId],
        queryFn: () => (userId ? fetchUser(userId) : Promise.resolve(null)),
        enabled: !!userId, // Only fetch if userId is available
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}
