export { TrafficStationSchema } from "./TrafficStationSchema";
export { PlugTypeSchema } from "./PlugTypeSchema";
export { OwnsEVSchema } from "./OwnsEVSchema";
export { PlugInstanceSchema } from "./PlugInstanceSchema";
export { HasPlugsSchema } from "./HasPlugsSchema";
export { TrafficVolumeSchema } from "./TrafficVolumeSchema";
export { HourVolumeDataSchema } from "./HourVolumeDataSchema";

import { z } from "zod";

// ElectricVehicleSchema
export const ElectricVehicle = z.object({
    ev_id: z.number().optional(),
    make: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    plug_type: z.number().nullable().optional(),
    range_km: z.number().optional(),
    battery_capacity: z.number().optional(),
});

export type ElectricVehicle = z.infer<typeof ElectricVehicle>;

export const ElectricVehicleArray = z.array(ElectricVehicle);

// UserSchema
export const User = z.object({
    user_id: z.number(), // Auto-incremented, optional for inserts
    username: z.string().max(100),
    email: z.string().email().max(100),
    password: z.string().length(32), // Fixed 32 characters
    ssn: z.string().length(11), // Optional, could be a specific format
    address: z.string().max(100),
    state: z.string().length(2),
    city: z.string().max(100),
    zip: z.string().max(10),
    first_name: z.string().max(100),
    last_name: z.string().max(100),
    middle_initial: z.string().length(1),
    creation_date: z
        .string()
        .refine((date) => !date || !isNaN(Date.parse(date)), {
            message: "Invalid ISO 8601 date-time string",
        }), // Validate the datetime string from server
});

export type User = z.infer<typeof User>;

export const UserArray = z.array(User);

// EVStations Schema
export const EVStation = z.object({
    station_id: z.number().optional(),
    name: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    state: z.string().length(2).optional(),
    zip: z.string().max(10).optional(),
    city: z.string().max(100).optional(),
    address: z.string().max(100).optional(),
    phone: z.string().max(100).optional(),
});

export type EVStation = z.infer<typeof EVStation>;

export const EVStationArray = z.array(EVStation);

// Compatible EV Stations Schema
export const CompatibleEVStationsSchema = z.object({
    latitude: z
        .string()
        .regex(/^-?\d+(\.\d+)?$/, "Invalid latitude")
        .min(1),
    longitude: z
        .string()
        .regex(/^-?\d+(\.\d+)?$/, "Invalid longitude")
        .min(1),
    distance_threshold: z
        .string()
        .regex(/^\d+$/, "Must be a valid number")
        .min(1),
    ev_id: z.string().regex(/^\d+$/, "Must be a valid number").min(1),
});

export type CompatibleEVStationsForm = z.infer<
    typeof CompatibleEVStationsSchema
>;

// OwnsVehicle and NewVehicle
export const OwnedVehicleSchema = z.object({
    user_id: z.number().int(),
    ev_id: z.number().int(),
});

export type OwnedVehicle = z.infer<typeof OwnedVehicleSchema>;

export const NewVehicleSchema = z.object({
    make: z.string().max(100),
    model: z.string().max(100),
    plug_type: z.number().int(),
    range_km: z.number().int(),
    battery_capacity: z.number(),
});

export type NewVehicle = z.infer<typeof NewVehicleSchema>;

// Best EVs for Trip
export const GetBestElectricVehiclesForTripSchema = z.object({
    city1_latitude: z.number().min(-90).max(90),
    city1_longitude: z.number().min(-180).max(180),
    city2_latitude: z.number().min(-90).max(90),
    city2_longitude: z.number().min(-180).max(180),
    distance_threshold: z.number().min(0),
});

export type GetBestElectricVehiclesForTripParams = z.infer<
    typeof GetBestElectricVehiclesForTripSchema
>;

// Heatmap
export const CongestionScoreForEVStationsSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    distance_threshold: z.number().min(0),
    hour_range: z.number().min(0),
    current_hour: z.number().min(0).max(23),
    max_congestion_value_range: z.number().min(0),
    softmax_temp: z.number().min(0),
});

export type CongestionScoreForEVStationsParams = z.infer<
    typeof CongestionScoreForEVStationsSchema
>;
