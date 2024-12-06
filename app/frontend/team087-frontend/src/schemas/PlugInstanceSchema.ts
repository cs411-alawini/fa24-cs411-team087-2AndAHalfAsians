import { z } from "zod";

export const PlugInstanceSchema = z.object({
    instance_id: z.number().optional(),
    type_id: z.number().nullable().optional(),
    power_output: z.number().optional(),
    in_use: z.boolean(),
    base_price: z.number().min(0).max(9999.99).optional(),
    usage_price: z.number().min(0).max(9999.99).optional(),
});
