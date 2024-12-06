import { z } from "zod";

export const TrafficVolumeSchema = z.object({
  volume_id: z.number().optional(),
  state_code: z.string().length(2),
  station_id: z.string().max(6),
});
