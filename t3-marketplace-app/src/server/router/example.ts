import { createRouter } from "./context";
import { z } from "zod";

export const exampleRouter = createRouter()
	.query("hello", {
		input: z
			.object({
				text: z.string().nullish(),
			})
			.nullish(),
		resolve({ input }) {
			return {
				greeting: `Hello ${input?.text ?? "world"}`,
			};
		},
	})
	.query("goodbye", {
		input: z
			.object({
				text: z.string().nullish(),
				number: z.number(),
			})
			.nullish(),
		resolve({ input }) {
			return {
				greeting: `Goodbye ${input?.text ?? "world"}, your number is ${
					input?.number ?? "9001"
				}`,
			};
		},
	});
