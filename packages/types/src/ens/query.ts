import { z } from "zod";

export const ensQueryQuerySchema = z.object({
  name: z.string(),
});

export const ensQuerySchema = z.object({
  domains: z.array(
    z.object({
      name: z.string(),
      resolver: z.object({
        addr: z.object({
          id: z.string(),
        }),
      }),
    }),
  ),
});

export type EnsQuery = z.infer<typeof ensQuerySchema>;
