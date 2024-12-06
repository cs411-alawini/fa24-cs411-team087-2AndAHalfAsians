import { z } from "zod";

export const HasPlugsSchema = z.object({
  station_id: z.number(),
  instance_id: z.number(),
});
