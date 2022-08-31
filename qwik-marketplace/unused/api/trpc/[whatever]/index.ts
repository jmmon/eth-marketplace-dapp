// expose tRPC Api

import type { EndpointHandler } from "@builder.io/qwik-city";
import { resolveTRPCResponse } from "trpc-qwik-city";
import { createContext, appRouter } from "~/server/trpc";

// GET manage queries
export const onGet: EndpointHandler = async ({ request, params }) => {
  const response = await resolveTRPCResponse({
    request,
    // params,
    appRouter,
    // createContext,
  });
  const json = await response.json();
  return json;
};

// POST manage mutations
export const onPost: EndpointHandler = async ({ request, params }) => {
  const response = await resolveTRPCResponse({
    request,
    // params,
    appRouter,
    // createContext,
  });
  const json = await response.json();
  return json;
};
