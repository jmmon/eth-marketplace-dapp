import { createContext } from "@builder.io/qwik";

export const SessionContext = createContext<ISessionContext>(
  "metamask-session-context"
);
