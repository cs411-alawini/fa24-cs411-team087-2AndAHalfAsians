"use client";

import { useState, useEffect, useRef } from "react";
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
    Table,
    Space,
} from "@mantine/core";
import Map from "@/components/map";
import { Marker, Popup, useMap } from "react-leaflet";
import {
    ElectricVehicle,
    CompatibleEVStationsForm,
    CompatibleEVStationsSchema,
} from "@/schemas";
import { latLng, LatLng, LatLngExpression, LeafletMouseEvent } from "leaflet";
import {
    CompatibleEVStation,
    CongestionScoreForEVStationsResults,
    GetBestElectricVehiclesForTripResults,
} from "@/interfaces/interfaces";
import { getCompatibleStations } from "@/lib/data/EVStation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import CompatibleEVStationsFormComponent from "@/components/forms/CompatibleEVStationsForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { EVStationMarkers } from "@/components/map/MapMarkers";
import { fetchOwnedVehicles } from "@/lib/data/User";
import BestEVsForTripFormComponent from "@/components/forms/BestEVsForTripForm";
import BestEVsTable from "@/components/common/BestEVsTable";
import RoutingMachine from "@/components/map/RoutingMachine";
import HeatmapLayer from "@/components/map/HeatmapLayer";
import CongestionScoreFormComponent from "@/components/forms/CongestionScoreForm";
import PlugInstanceStatsFormComponent from "@/components/forms/PlugInstanceStatsForm";
import PlugInstanceStatsTable from "@/components/common/PlugInstanceStatsTable";
import {
    GetPlugInstanceStatsResults,
    GetPlugTypeResults,
} from "@/interfaces/interfaces";


function MapControl({
    selectedTab,
    onMapClick,
}: {
    selectedTab: string;
    onMapClick: (e: LeafletMouseEvent) => void;
}) {
    const map = useMap();
    map.doubleClickZoom.disable();

    useEffect(() => {
        // switch (selectedTab) {
        //     case "compatible-stations":
        //         map.dragging.enable();
        //         map.touchZoom.enable();
        //         break;
        //     case "view-congestion-heatmap":
        //         map.dragging.disable();
        //         map.touchZoom.disable();
        //         break;
        //     case "query-3":
        //         map.dragging.disable();
        //         map.touchZoom.disable();
        //         break;
        //     case "query-4":
        //         map.dragging.disable();
        //         map.touchZoom.disable();
        //         break;

        //     default:
        //         break;
        // }

        map.on("dblclick", onMapClick);

        return () => {
            map.off("dblclick", onMapClick);
        };
    }, [map, onMapClick, selectedTab]);

    return null;
}

export default function MapPage() {
    const { data: currentUser, isLoading, error } = useCurrentUser();

    const [stations, setStations] = useState<CompatibleEVStation[]>([]);
    const [ownedVehicles, setOwnedVehicles] = useState<ElectricVehicle[]>([]);
    const [selectedTab, setSelectedTab] = useState("compatible-stations");
    const [selectedLocation, setSelectedLocation] = useState<LatLng>(
        new LatLng(34.040539, -118.271387)
    );

    const [bestEVs, setBestEVs] = useState<
        GetBestElectricVehiclesForTripResults[]
    >([]);

    const [heatmapPoints, setHeatmapPoints] = useState<
        [number, number, number][]
    >([]);
    const [heatmapRadius, setHeatmapRadius] = useState(25);
    const [heatmapBlur, setHeatmapBlur] = useState(15);
    const [heatmapMax, setHeatmapMax] = useState(1.0);
    const [heatmapMaxZoom, setHeatmapMaxZoom] = useState(17);
    const [heatmapMinOpacity, setHeatmapMinOpacity] = useState(0.1);
    const [heatmapGradient, setHeatmapGradient] = useState<{
        [key: number]: string;
    }>({
        0.4: "blue",
        0.65: "lime",
        1: "red",
    });

    const [plugInstanceStats, setPlugInstanceStats] = useState<
        GetPlugInstanceStatsResults[]
    >([]);

    function handleHeatmapDataFetched(
        data: CongestionScoreForEVStationsResults[]
    ) {
        const points = data.map(
            (item) =>
                [item.latitude, item.longitude, item.CongestionScore] as [
                    number,
                    number,
                    number,
                ]
        );
        setHeatmapPoints(points);
    }

    const startMarkerRef = useRef(null);
    const [startPosition, setStartPosition] = useState<LatLng>(
        new LatLng(39.8416184160534, -81.21093750000001)
    );

    const endMarkerRef = useRef(null);
    const [endPosition, setEndPosition] = useState<LatLng>(
        new LatLng(40.24590854666475, -115.751953125)
    );

    function handleOnMapClick(e: LeafletMouseEvent) {
        console.log("Map clicked at", e.latlng);
        setSelectedLocation(e.latlng);
    }

    useEffect(() => {
        if (currentUser) {
            fetchOwnedVehicles(currentUser.user_id.toString()).then(
                setOwnedVehicles
            );
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
        <Container
            fluid
            style={{
                padding: "1rem",
                height: "100vh",
                flexDirection: "column",
            }}
        >
            <Card
                withBorder
                shadow="sm"
                mb="xs"
                style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "0",
                    minHeight: "50%",
                }}
            >
                <Map>
                    <MapControl
                        selectedTab={selectedTab}
                        onMapClick={handleOnMapClick}
                    />
                    {selectedTab === "compatible-stations" && (
                        <EVStationMarkers stations={stations} />
                    )}

                    {selectedTab === "view-congestion-heatmap" && (
                        <HeatmapLayer
                            points={heatmapPoints}
                            radius={heatmapRadius}
                            blur={heatmapBlur}
                            max={heatmapMax}
                            maxZoom={heatmapMaxZoom}
                            minOpacity={heatmapMinOpacity}
                            gradient={heatmapGradient}
                        />
                    )}

                    {selectedTab === "best-evs" && (
                        <>
                            <Marker
                                draggable={true}
                                eventHandlers={{
                                    dragend: (e) => {
                                        setStartPosition(e.target.getLatLng());
                                    },
                                }}
                                position={startPosition}
                                ref={startMarkerRef}
                            />
                            <Marker
                                draggable={true}
                                eventHandlers={{
                                    dragend: (e) => {
                                        setEndPosition(e.target.getLatLng());
                                    },
                                }}
                                position={endPosition}
                                ref={endMarkerRef}
                            />
                            <RoutingMachine
                                waypoints={[startPosition, endPosition]}
                            />
                        </>
                    )}
                </Map>
            </Card>
            <Card withBorder shadow="sm" style={{ flexShrink: 0 }}>
                <Tabs
                    defaultValue="compatible-stations"
                    onChange={(value) =>
                        setSelectedTab(value ?? "compatible-stations")
                    }
                >
                    <Tabs.List>
                        <Tabs.Tab value="compatible-stations">
                            Compatible Stations
                        </Tabs.Tab>
                        <Tabs.Tab value="view-congestion-heatmap">
                            View Congestion Heatmap
                        </Tabs.Tab>
                        <Tabs.Tab value="best-evs">Best EVs for Trip</Tabs.Tab>
                        <Tabs.Tab value="plug-stats">
                            Plug Instance Stats
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="compatible-stations" pt="sm">
                        <CompatibleEVStationsFormComponent
                            selectedLocation={selectedLocation}
                            onStationsFetched={setStations}
                            ownedVehicles={ownedVehicles}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="view-congestion-heatmap" pt="sm">
                        <CongestionScoreFormComponent
                            onResultsFetched={handleHeatmapDataFetched}
                            selectedLocation={selectedLocation}
                            onRadiusChange={setHeatmapRadius}
                            radius={heatmapRadius}
                            onBlurChange={setHeatmapBlur}
                            blur={heatmapBlur}
                            onMaxChange={setHeatmapMax}
                            max={heatmapMax}
                            onMaxZoomChange={setHeatmapMaxZoom}
                            maxZoom={heatmapMaxZoom}
                            onMinOpacityChange={setHeatmapMinOpacity}
                            minOpacity={heatmapMinOpacity}
                            onGradientChange={setHeatmapGradient}
                            gradient={heatmapGradient}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="best-evs" pt="sm">
                        <BestEVsForTripFormComponent
                            onResultsFetched={setBestEVs}
                            startPosition={startPosition}
                            endPosition={endPosition}
                        />
                        <Space h="md" />
                        {bestEVs.length > 0 && <BestEVsTable data={bestEVs} />}
                    </Tabs.Panel>
                    <Tabs.Panel value="plug-stats" pt="sm">
                        <PlugInstanceStatsFormComponent
                            onResultsFetched={setPlugInstanceStats}
                            selectedLocation={selectedLocation}
                        />
                        <Space h="md" />
                        {plugInstanceStats.length > 0 && (
                            <PlugInstanceStatsTable data={plugInstanceStats} />
                        )}
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Container>
    );
}
