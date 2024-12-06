"use client";

// providers/UserProvider.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserArray } from "@/schemas";
import { BASE_URL } from "@/lib/query";

interface UserContextType {
    userId: string | null;
    setUserId: (id: string | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Fetch user details by user ID.
 * @param userId - The ID of the user to fetch.
 * @returns A User object if successful, or null if an error occurs.
 */
export const fetchUser = async (userId: string): Promise<User | null> => {
    try {
        const response = await fetch(
            `${BASE_URL}/User/GetUserByUserId/?user_id=${userId}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (response.ok) {
            const userData = await response.json();
            const validatedUserData = UserArray.parse(userData); // Validate response
            return validatedUserData[0];
        } else {
            console.error("Failed to fetch user:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [userId, setUserIdState] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const storedUserId = sessionStorage.getItem("userId");
        if (storedUserId) {
            setUserIdState(storedUserId);
        }
        setLoading(false);
    }, []);

    const setUserId = (id: string | null) => {
        setUserIdState(id);
        if (id) {
            sessionStorage.setItem("userId", id);
        } else {
            sessionStorage.removeItem("userId");
        }
    };

    return (
        <UserContext.Provider value={{ userId, setUserId, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
