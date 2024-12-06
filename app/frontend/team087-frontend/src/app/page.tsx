import {
    Container,
    Card,
    Title,
    Text,
    Button,
    Group,
    Stack,
    // Anchor,
} from "@mantine/core";
import Link from "next/link";

import { UserCard, OwnedVehiclesCard } from "./page.client";

export default async function HomePage() {
    return (
        <Container size="lg">
            <Stack>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" align="center">
                        <Stack>
                            <Title order={1} mb="sm">
                                Welcome to the Electric Vehicle Hub
                            </Title>
                            <Text size="md" c="dimmed">
                                The central hub for all electric vehicle needs.
                            </Text>
                        </Stack>
                    </Group>

                    <Button
                        component={Link}
                        href="/map"
                        variant="gradient"
                        gradient={{ from: "indigo", to: "cyan" }}
                        size="md"
                        mt="lg"
                    >
                        View Map
                    </Button>
                </Card>

                <UserCard />

                <OwnedVehiclesCard />

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="sm" c="dimmed" ta="center">
                        © 2024 Electric Vehicle Hub. All rights reserved.
                    </Text>
                </Card>
            </Stack>
        </Container>
    );
}
