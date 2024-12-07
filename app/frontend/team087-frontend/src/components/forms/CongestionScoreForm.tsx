"use client";

import {
    Button,
    Stack,
    TextInput,
    Title,
    Slider,
    ColorInput,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LatLng } from "leaflet";
import {
    CongestionScoreForEVStationsParams,
    CongestionScoreForEVStationsResults,
} from "@/interfaces/interfaces";
import { getCongestionScoreForEVStations } from "@/lib/data/EVStation";
import { CongestionScoreForEVStationsSchema } from "@/schemas";

interface CongestionScoreFormProps {
    onResultsFetched: (results: CongestionScoreForEVStationsResults[]) => void;
    selectedLocation: LatLng;
    onRadiusChange: (radius: number) => void;
    radius: number;
    onBlurChange: (blur: number) => void;
    blur: number;
    onMaxChange: (max: number) => void;
    max: number;
    onMaxZoomChange: (maxZoom: number) => void;
    maxZoom: number;
    onMinOpacityChange: (minOpacity: number) => void;
    minOpacity: number;
    onGradientChange: (gradient: { [key: number]: string }) => void;
    gradient: { [key: number]: string };
}

export default function CongestionScoreFormComponent({
    onResultsFetched,
    selectedLocation,
    onRadiusChange,
    radius,
    onBlurChange,
    blur,
    onMaxChange,
    max,
    onMaxZoomChange,
    maxZoom,
    onMinOpacityChange,
    minOpacity,
    onGradientChange,
    gradient,
}: CongestionScoreFormProps) {
    const { register, handleSubmit, formState } =
        useForm<CongestionScoreForEVStationsParams>({
            resolver: zodResolver(CongestionScoreForEVStationsSchema),
            defaultValues: {
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                distance_threshold: 20,
                hour_range: 1,
                current_hour: new Date().getHours(),
                max_congestion_value_range: 100,
                softmax_temp: 5,
            },
        });

    const mutation = useMutation({
        mutationFn: getCongestionScoreForEVStations,
        onSuccess: (data) => {
            onResultsFetched(data); // Callback to update parent state
        },
        onError: (error: any) => {
            console.error("Error fetching congestion score:", error.message);
        },
    });

    const onSubmit = (data: CongestionScoreForEVStationsParams) => {
        data.latitude = selectedLocation.lat; // Update latitude with selected location
        data.longitude = selectedLocation.lng; // Update longitude with selected location
        mutation.mutate(data); // Trigger mutation with form data
    };

    const handleGradientChange = (key: number, color: string) => {
        onGradientChange({ ...gradient, [key]: color });
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
                <TextInput
                    label="Hour Range"
                    placeholder="Enter hour range"
                    {...register("hour_range", { valueAsNumber: true })}
                    error={formState.errors.hour_range?.message}
                />
                <TextInput
                    label="Current Hour"
                    placeholder="Enter current hour"
                    {...register("current_hour", { valueAsNumber: true })}
                    error={formState.errors.current_hour?.message}
                />
                <TextInput
                    label="Max Congestion Value Range"
                    placeholder="Enter max congestion value range"
                    {...register("max_congestion_value_range", {
                        valueAsNumber: true,
                    })}
                    error={formState.errors.max_congestion_value_range?.message}
                />
                <TextInput
                    label="Softmax Temperature"
                    placeholder="Enter softmax temperature"
                    {...register("softmax_temp", { valueAsNumber: true })}
                    error={formState.errors.softmax_temp?.message}
                />
                <Button
                    type="submit"
                    loading={mutation.isPending}
                    fullWidth
                    mt="sm"
                >
                    Fetch Heatmap Data
                </Button>
            </form>
            <Title order={5} mt="md">
                Heatmap Options
            </Title>
            <Slider
                label={(value) => `Radius: ${value}px`}
                value={radius}
                onChange={onRadiusChange}
                min={1}
                max={50}
                step={1}
            />
            <Slider
                label={(value) => `Blur: ${value}px`}
                value={blur}
                onChange={onBlurChange}
                min={1}
                max={50}
                step={1}
            />
            <Slider
                label={(value) => `Max Intensity: ${value}`}
                value={max}
                onChange={onMaxChange}
                min={0.1}
                max={10}
                step={0.1}
            />
            <Slider
                label={(value) => `Max Zoom: ${value}`}
                value={maxZoom}
                onChange={onMaxZoomChange}
                min={1}
                max={20}
                step={1}
            />
            <Slider
                label={(value) => `Min Opacity: ${value}`}
                value={minOpacity}
                onChange={onMinOpacityChange}
                min={0}
                max={1}
                step={0.1}
            />
            <Title order={5} mt="md">
                Gradient Colors
            </Title>
            {Object.keys(gradient).map((key) => (
                <ColorInput
                    key={key}
                    label={`Gradient ${key}`}
                    value={gradient[Number(key)]}
                    onChange={(color) =>
                        handleGradientChange(Number(key), color)
                    }
                />
            ))}
        </Stack>
    );
}
