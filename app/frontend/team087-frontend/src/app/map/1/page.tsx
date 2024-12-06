"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Card,
    Container,
    Stack,
    Tabs,
    TextInput,
    Title,
    Text,
    NumberFormatter,
} from "@mantine/core";
import Map from "@/components/map/Map";
import { Marker, Popup, useMap } from "react-leaflet";
import {
    ElectricVehicle,
    CompatibleEVStationsForm,
    CompatibleEVStationsSchema,
} from "@/schemas";
import { LatLngExpression } from "leaflet";
import { CompatibleEVStation } from "@/interfaces/interfaces";
import { getCompatibleStations } from "@/lib/data/EVStation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import CompatibleEVStationsFormComponent from "@/components/forms/CompatibleEVStationsForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { EVStationMarkers } from "@/components/map/MapMarkers";
import { fetchOwnedVehicles } from "@/lib/data/User";

function MapControl() {
    const map = useMap();

    return null;
}

export default function MapPage() {
    const { data: currentUser, isLoading, error } = useCurrentUser();

    const [stations, setStations] = useState<CompatibleEVStation[]>([]);
    const [ownedVehicles, setOwnedVehicles] = useState<ElectricVehicle[]>([]);

    useEffect(() => {
        if (currentUser) {
            fetchOwnedVehicles(currentUser.user_id.toString()).then(setOwnedVehicles);
        }
    }, [currentUser]);

    if (isLoading) {
        return <div>Loading user...</div>;
    }

    if (error) {
        return <div>Error fetching user: {error.message}</div>;
    }

    if (!currentUser) {
        return <div>Please log in to access the map.</div>;
    }

    // Render the page content after the user is logged in
    return (
        <Container fluid style={{ padding: "1rem" }}>
            <Card withBorder shadow="sm" mb="xs">
                <Map>
                    <MapControl />
                    <EVStationMarkers stations={stations} />
                </Map>
            </Card>
            <Card withBorder shadow="sm">
                <Tabs defaultValue="compatible-stations">
                    <Tabs.List>
                        <Tabs.Tab value="compatible-stations">
                            Compatible Stations
                        </Tabs.Tab>
                        <Tabs.Tab value="view-congestion-heatmap">
                            View Congestion Heatmap
                        </Tabs.Tab>
                        <Tabs.Tab value="query-3">Query 3</Tabs.Tab>
                        <Tabs.Tab value="query-4">Query 4</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="compatible-stations" pt="sm">
                        <CompatibleEVStationsFormComponent
                            onStationsFetched={setStations}
                            ownedVehicles={ownedVehicles}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="view-congestion-heatmap" pt="sm">
                        There should be a button here
                    </Tabs.Panel>
                    <Tabs.Panel value="query-3" pt="sm">
                        There should be a button here
                    </Tabs.Panel>
                    <Tabs.Panel value="query-4" pt="sm">
                        There should be a button here
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Container>
    );
}
