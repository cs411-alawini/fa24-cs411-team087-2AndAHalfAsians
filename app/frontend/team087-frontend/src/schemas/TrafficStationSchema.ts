import { z } from "zod";

export const TrafficStationSchema = z.object({
    state_code: z.string().length(2),
    station_id: z.string().max(6),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});
