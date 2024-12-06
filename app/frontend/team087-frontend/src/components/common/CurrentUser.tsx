"use client";

import React from "react";
import { Dialog, Group, Button, Text, Badge } from "@mantine/core";
import { useUser } from "@/providers/UserProvider";

const CurrentUser: React.FC = () => {
    const { userId, setUserId } = useUser();

    const handleLogout = () => {
        setUserId(null); // Clear the user ID to log out
    };

    if (!userId) {
        return null; // Do not render if no user is logged in
    }

    return (
        <Dialog
            opened={true}
            withCloseButton={false} // No close button as dialog is always visible
            size="md"
            radius="md"
            position={{ bottom: 16, left: 16 }}
            zIndex={400}
        >
            <Text size="lg" fw={500} mb="sm">
                Current User
            </Text>
            <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                    Logged in as:
                </Text>
                <Badge color="blue" size="lg" radius="sm">
                    {userId}
                </Badge>
            </Group>
            <Button
                onClick={handleLogout}
                mt="md"
                fullWidth
                variant="outline"
                color="red"
            >
                Logout
            </Button>
        </Dialog>
    );
};

export default CurrentUser;
