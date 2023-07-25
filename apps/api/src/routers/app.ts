import { publicProcedure, router } from "@/trpc";
import { userRouter } from "./user";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
  user: userRouter,
});

export type AppRouter = typeof appRouter;
