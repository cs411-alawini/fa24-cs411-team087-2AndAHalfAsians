"use client";

import { Button, Stack, TextInput, Title, Select } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ElectricVehicle,
    CompatibleEVStationsForm,
    CompatibleEVStationsSchema,
} from "@/schemas";
import { useMutation } from "@tanstack/react-query";
import { getCompatibleStations } from "@/lib/data/EVStation";
import { CompatibleEVStation } from "@/interfaces/interfaces";
import { LatLng } from "leaflet";

interface CompatibleEVStationsFormProps {
    selectedLocation: LatLng;
    onStationsFetched: (stations: CompatibleEVStation[]) => void;
    ownedVehicles?: ElectricVehicle[];
}

export default function CompatibleEVStationsFormComponent({
    selectedLocation,
    onStationsFetched,
    ownedVehicles,
}: CompatibleEVStationsFormProps) {
    const { setValue, register, handleSubmit, formState } =
        useForm<CompatibleEVStationsForm>({
            resolver: zodResolver(CompatibleEVStationsSchema),
            defaultValues: {
                latitude: selectedLocation.lat.toString(),
                longitude: selectedLocation.lng.toString(),
                distance_threshold: "100",
                ev_id: "", // Initialize with an empty string
            },
        });

    const mutation = useMutation({
        mutationFn: getCompatibleStations,
        onSuccess: (data) => {
            onStationsFetched(data); // Callback to update parent state
        },
        onError: (error: any) => {
            console.error("Error fetching stations:", error.message);
        },
    });

    const onSubmit = (data: CompatibleEVStationsForm) => {
        data.longitude = selectedLocation.lng.toString(); // Update longitude
        data.latitude = selectedLocation.lat.toString(); // Update latitude
        mutation.mutate(data); // Trigger mutation with form data
    };

    return (
        <Stack>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                    label="Latitude"
                    placeholder="Enter latitude"
                    value={selectedLocation.lat.toString()}
                    disabled
                    {...register("latitude")}
                    error={formState.errors.latitude?.message}
                />
                <TextInput
                    label="Longitude"
                    placeholder="Enter longitude"
                    value={selectedLocation.lng.toString()}
                    disabled
                    {...register("longitude")}
                    error={formState.errors.longitude?.message}
                />
                <TextInput
                    label="Distance Threshold"
                    placeholder="Enter distance in miles"
                    {...register("distance_threshold")}
                    error={formState.errors.distance_threshold?.message}
                />
                {ownedVehicles && ownedVehicles.length > 0 ? (
                    <Select
                        label="EV ID"
                        placeholder="Select your vehicle"
                        data={ownedVehicles
                            .filter((vehicle) => !!vehicle.ev_id)
                            .map((vehicle) => ({
                                value: vehicle.ev_id?.toString() || "",
                                label: `${vehicle.make} ${vehicle.model}`,
                            }))}
                        onChange={(value) => setValue("ev_id", value || "")} // Set value as string
                        error={formState.errors.ev_id?.message}
                    />
                ) : (
                    <TextInput
                        label="EV ID"
                        placeholder="Enter EV ID"
                        {...register("ev_id")}
                        error={formState.errors.ev_id?.message}
                    />
                )}
                <Button
                    type="submit"
                    loading={mutation.isPending}
                    fullWidth
                    mt="sm"
                >
                    Search
                </Button>
            </form>
        </Stack>
    );
}
