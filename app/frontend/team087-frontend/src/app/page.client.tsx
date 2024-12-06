"use client";

import { useState, useEffect } from "react";
import { Anchor, Card, Group, Title, Text, Image } from "@mantine/core";
import Link from "next/link";
import NextImage from "next/image";
import { useQuery } from "@tanstack/react-query";

import { useUser, fetchUser } from "@/providers/UserProvider";
import { BASE_URL } from "@/lib/query";
import {
    //User,
    ElectricVehicle,
    ElectricVehicleArray,
} from "@/schemas";

export function UserCard() {
    const { userId } = useUser();

    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => fetchUser(userId!),

        enabled: !!userId,
    });

    if (!userId) {
        return "Error: Missing userId in User context";
    }

    if (isLoading) {
        return (
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Loading User Profile...
                </Title>
            </Card>
        );
    }

    if (error) {
        return (
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Error
                </Title>
                <Text c="red">{(error as Error).message}</Text>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Error
                </Title>
                <Text c="red">Error: Missing user object in UserCard</Text>
            </Card>
        );
    }

    return (
        <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
                <Title order={2} mb="md">
                    User Profile
                </Title>
                <Anchor component={Link} href="/profile">
                    Edit Profile
                </Anchor>
            </Group>
            <Text size="sm" mb="xs">
                <strong>Username:</strong> {user.username}
            </Text>
            <Text size="sm" mb="xs">
                <strong>Email:</strong> {user.email}
            </Text>
            <Text size="sm" mb="xs">
                <strong>Address:</strong> {user.address}, {user.city},{" "}
                {user.state} {user.zip}
            </Text>
            <Text size="sm">
                <strong>Name:</strong> {user.first_name} {user.last_name}
            </Text>
        </Card>
    );
}

export function OwnedVehiclesCard() {
    const { userId, isLoading } = useUser();
    const [vehicles, setVehicles] = useState<ElectricVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOwnedVehicles = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/OwnsEV/GetOwnedVehicles/?user_id=${userId}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const validatedVehicles = ElectricVehicleArray.parse(data); // Validate response
                    setVehicles(validatedVehicles);
                } else {
                    const errorText = await response.text();
                    setError(
                        `Failed to fetch vehicles: ${response.statusText} - ${errorText}`
                    );
                }
            } catch (err) {
                setError(`Error fetching vehicles: ${err}`);
            } finally {
                setLoading(false);
            }
        };

        fetchOwnedVehicles();
    }, [userId, isLoading]);

    if (loading) {
        return (
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Loading Vehicles...
                </Title>
            </Card>
        );
    }

    if (error) {
        return (
            <Card padding="lg" radius="md" withBorder>
                <Title order={2} mb="md">
                    Error
                </Title>
                <Text c="red">{error}</Text>
            </Card>
        );
    }

    return (
        <Card padding="lg" radius="md" withBorder>
            <Group justify="space-between">
                <Title order={2} mb="md">
                    Owned Vehicles
                </Title>
                <Anchor component={Link} href="/vehicles">
                    View All Vehicles
                </Anchor>
            </Group>
            <Group justify="space-between" gap="lg">
                {vehicles.length === 0 ? (
                    <Text>No vehicles owned.</Text>
                ) : (
                    vehicles.map((vehicle: ElectricVehicle) => (
                        <Card
                            key={vehicle.ev_id}
                            shadow="sm"
                            padding="lg"
                            radius="md"
                            withBorder
                            style={{ width: "30%" }}
                        >
                            <Image
                                component={NextImage}
                                src="/300x200.svg" // Replace with a real image URL if available
                                alt={`${vehicle.make || "Unknown"} ${vehicle.model || "Vehicle"}`}
                                width={300}
                                height={200}
                                radius="md"
                                mb="md"
                            />
                            <Title order={3} mb="sm">
                                {vehicle.make || "Unknown Make"}{" "}
                                {vehicle.model || "Unknown Model"}
                            </Title>
                            <Text size="sm" mb="xs">
                                <strong>Battery Capacity:</strong>{" "}
                                {vehicle.battery_capacity || "N/A"} kWh
                            </Text>
                            <Text size="sm">
                                <strong>Range:</strong>{" "}
                                {vehicle.range_km || "N/A"} km
                            </Text>
                        </Card>
                    ))
                )}
            </Group>
        </Card>
    );
}
