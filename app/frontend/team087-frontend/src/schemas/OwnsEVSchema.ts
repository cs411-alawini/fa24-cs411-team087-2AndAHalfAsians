import { z } from "zod";

export const OwnsEVSchema = z.object({
  user_id: z.number(),
  ev_id: z.number(),
});
