import { createRouter } from "./context";
import { z } from "zod";

export const anotherExampleRouter = createRouter().query("goodbye", {
  input: z
    .object({
      text: z.string().nullish(),
    })
    .nullish(),
  resolve({ input }) {
    return {
      greeting: `Goodbye ${input?.text ?? "world"}`,
    };
  },
});
