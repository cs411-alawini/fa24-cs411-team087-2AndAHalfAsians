import { z } from "zod";

export const PlugTypeSchema = z.object({
  type_id: z.number().optional(),
  type_name: z.string().max(100).optional(),
});
