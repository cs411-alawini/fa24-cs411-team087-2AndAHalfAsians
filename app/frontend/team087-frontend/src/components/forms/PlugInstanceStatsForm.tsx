"use client";

import { Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LatLng } from "leaflet";
import {
    GetPlugInstanceStatsParams,
    GetPlugInstanceStatsResults,
} from "@/interfaces/interfaces";
import { getPlugInstanceStats } from "@/lib/data/EVStation";
import { GetPlugInstanceStatsSchema } from "@/schemas";

interface PlugInstanceStatsFormProps {
    onResultsFetched: (results: GetPlugInstanceStatsResults[]) => void;
    selectedLocation: LatLng;
}

export default function PlugInstanceStatsFormComponent({
    onResultsFetched,
    selectedLocation,
}: PlugInstanceStatsFormProps) {
    const { register, handleSubmit, formState } =
        useForm<GetPlugInstanceStatsParams>({
            resolver: zodResolver(GetPlugInstanceStatsSchema),
            defaultValues: {
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                distance_threshold: 20,
            },
        });

    const mutation = useMutation({
        mutationFn: getPlugInstanceStats,
        onSuccess: (data) => {
            onResultsFetched(data); // Callback to update parent state
        },
        onError: (error: any) => {
            console.error("Error fetching plug instance stats:", error.message);
        },
    });

    const onSubmit = (data: GetPlugInstanceStatsParams) => {
        data.latitude = selectedLocation.lat; // Update latitude with selected location
        data.longitude = selectedLocation.lng; // Update longitude with selected location
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
                    {...register("latitude", { valueAsNumber: true })}
                    error={formState.errors.latitude?.message}
                />
                <TextInput
                    label="Longitude"
                    placeholder="Enter longitude"
                    value={selectedLocation.lng.toString()}
                    disabled
                    {...register("longitude", { valueAsNumber: true })}
                    error={formState.errors.longitude?.message}
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
                    Fetch Plug Instance Stats
                </Button>
            </form>
        </Stack>
    );
}
