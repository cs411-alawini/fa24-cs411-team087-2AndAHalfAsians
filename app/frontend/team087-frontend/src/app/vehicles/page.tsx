import { BASE_URL } from "@/lib/query";
import { 
    // ElectricVehicle,  
    ElectricVehicleArray } from "@/schemas";
import {
    Card,
    CardSection,
    // Table,
    // TableThead,
    // TableTr,
    // TableTh,
    // TableTbody,
    // TableTd,
    Title,
    Center,
    Container,
} from "@mantine/core";

import VehicleClientPage from "./page.client";

async function fetchVehicles() {
    const mockData = [
        {
            ev_id: 1,
            make: "Tesla",
            model: "Model S",
            plug_type: 1,
            range_km: 652,
            battery_capacity: 100,
        },
        {
            ev_id: 2,
            make: "Nissan",
            model: "Leaf",
            plug_type: 2,
            range_km: 240,
            battery_capacity: 40,
        },
        {
            ev_id: 3,
            make: "Chevrolet",
            model: "Bolt",
            plug_type: 1,
            range_km: 417,
            battery_capacity: 66,
        },
    ];

    const validatedMockData = ElectricVehicleArray.parse(mockData);

    return validatedMockData;

    const res = await fetch(`${BASE_URL}/api/vehicles`, {
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch vehicles");
    }

    return res.json();
}

export default async function VehiclesPage() {
    const vehicles = await fetchVehicles();

    return (
        <Container size="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <CardSection withBorder inheritPadding py="xs">
                    <Center>
                        <Title>Electric Vehicles</Title>
                    </Center>
                </CardSection>
                <VehicleClientPage vehicles={vehicles} />
            </Card>
        </Container>
    );
}
