"use client";

// providers/UserProvider.tsx
import React, { createContext, useState, useContext, useEffect } from "react";

interface UserContextType {
    userId: string | null;
    setUserId: (id: string | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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
        setLoading(false); // Stop loading once the user ID is checked
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
