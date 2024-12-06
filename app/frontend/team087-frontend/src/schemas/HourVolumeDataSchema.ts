import { z } from "zod";

export const HourVolumeDataSchema = z.object({
    volume_id: z.number(),
    month_record: z.number().int().min(1).max(12),
    year_record: z.number().int(),
    day_of_week: z.number().int().min(1).max(7),
    hour: z.number().int().min(0).max(23),
    volume: z.number().optional(),
});
