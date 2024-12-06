export { EVStationSchema } from "./EVStationSchema";
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
