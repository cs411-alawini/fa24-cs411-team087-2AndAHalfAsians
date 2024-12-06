"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    TextInput,
    Button,
    Stack,
    // LoadingOverlay
} from "@mantine/core";
import { useUser } from "@/providers/UserProvider";

const UserModal: React.FC = () => {
    const { userId, setUserId } = useUser();
    const [isModalOpen, setModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Show the login modal if userId is not set
    useEffect(() => {
        const checkUserStatus = async () => {
            if (!userId) {
                setModalOpen(true);
            }
        };

        checkUserStatus();
    }, [userId]);

    const handleLogin = () => {
        if (inputValue.trim()) {
            setUserId(inputValue.trim());
            setModalOpen(false);
        }
    };

    return (
        <Modal
            opened={isModalOpen}
            onClose={() => {}}
            withCloseButton={false}
            title="Login Required"
            centered
        >
            <Stack>
                <TextInput
                    placeholder="Enter your username or ID"
                    value={inputValue}
                    onChange={(event) =>
                        setInputValue(event.currentTarget.value)
                    }
                />
                <Button onClick={handleLogin}>Login</Button>
            </Stack>
        </Modal>
    );
};

export default UserModal;
