import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/routers/app";

const handler = (request: Request) => {
  console.log(`incoming request ${request.url}`);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: function (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      opts: FetchCreateContextFnOptions,
    ): object | Promise<object> {
      // empty context
      return {};
    },
  });
};

export const GET = handler;
export const POST = handler;
