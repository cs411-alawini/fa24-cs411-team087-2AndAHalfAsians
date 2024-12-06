"use client";

import { Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    GetBestElectricVehiclesForTripParams,
    GetBestElectricVehiclesForTripSchema,
} from "@/schemas";
import { useMutation } from "@tanstack/react-query";
import { getBestElectricVehiclesForTrip } from "@/lib/data/EVStation";
import { GetBestElectricVehiclesForTripResults } from "@/interfaces/interfaces";
import { LatLng } from "leaflet";

interface BestEVsForTripFormProps {
    onResultsFetched: (
        results: GetBestElectricVehiclesForTripResults[]
    ) => void;
    startPosition: LatLng;
    endPosition: LatLng;
}

export default function BestEVsForTripFormComponent({
    onResultsFetched,
    startPosition,
    endPosition,
}: BestEVsForTripFormProps) {
    const { register, handleSubmit, formState } =
        useForm<GetBestElectricVehiclesForTripParams>({
            resolver: zodResolver(GetBestElectricVehiclesForTripSchema),
            defaultValues: {
                city1_latitude: startPosition.lat,
                city1_longitude: startPosition.lng,
                city2_latitude: endPosition.lat,
                city2_longitude: endPosition.lng,
                distance_threshold: 20,
            },
        });

    const mutation = useMutation({
        mutationFn: getBestElectricVehiclesForTrip,
        onSuccess: (data) => {
            onResultsFetched(data); // Callback to update parent state
        },
        onError: (error: any) => {
            console.error("Error fetching best EVs for trip:", error.message);
        },
    });

    const onSubmit = (data: GetBestElectricVehiclesForTripParams) => {
        data.city1_latitude = startPosition.lat; // Update city1 latitude
        data.city1_longitude = startPosition.lng; // Update city1 longitude
        data.city2_latitude = endPosition.lat; // Update city2 latitude
        data.city2_longitude = endPosition.lng; // Update city2 longitude
        mutation.mutate(data); // Trigger mutation with form data
    };

    return (
        <Stack>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                    label="City 1 Latitude"
                    placeholder="Enter latitude for city 1"
                    value={startPosition.lat.toString()}
                    disabled
                    {...register("city1_latitude", { valueAsNumber: true })}
                    error={formState.errors.city1_latitude?.message}
                />
                <TextInput
                    label="City 1 Longitude"
                    placeholder="Enter longitude for city 1"
                    value={startPosition.lng.toString()}
                    disabled
                    {...register("city1_longitude", { valueAsNumber: true })}
                    error={formState.errors.city1_longitude?.message}
                />
                <TextInput
                    label="City 2 Latitude"
                    placeholder="Enter latitude for city 2"
                    value={endPosition.lat.toString()}
                    disabled
                    {...register("city2_latitude", { valueAsNumber: true })}
                    error={formState.errors.city2_latitude?.message}
                />
                <TextInput
                    label="City 2 Longitude"
                    placeholder="Enter longitude for city 2"
                    value={endPosition.lng.toString()}
                    disabled
                    {...register("city2_longitude", { valueAsNumber: true })}
                    error={formState.errors.city2_longitude?.message}
                />
                <TextInput
                    label="Distance Threshold"
                    placeholder="Enter distance threshold"
                    {...register("distance_threshold", { valueAsNumber: true })}
                    error={formState.errors.distance_threshold?.message}
                />
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
