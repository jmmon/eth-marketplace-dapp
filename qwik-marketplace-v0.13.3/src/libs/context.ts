import { createContextId } from "@builder.io/qwik";

export const SessionContext = createContextId<ISessionContext>(
  "metamask-session-context"
);
