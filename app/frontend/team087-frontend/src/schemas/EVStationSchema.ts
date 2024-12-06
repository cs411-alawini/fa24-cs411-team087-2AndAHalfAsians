import { z } from "zod";

export const EVStationSchema = z.object({
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
