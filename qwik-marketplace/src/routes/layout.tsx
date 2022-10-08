declare var window: any;
import {component$, Slot, useClientEffect$, useContextProvider, useStore} from "@builder.io/qwik";
import Header from "../components/header/header";
import {SessionContext} from "~/libs/context";
import Overlay from "~/components/overlay/overlay";
import {Link} from "@builder.io/qwik-city";
import Footer from "~/components/footer/footer";
import { metamaskInit } from "~/libs/ethUtils";

export default component$(() => {
	const session = useStore(
		{
			address: "", // address of the connected wallet
			create: {
				show: false,
				note: {
					message: "",
					class: "",
				},
			},
			items: {
				all: [],
				filtered: [],
				stale: true,
				showMissing: false,
			},
			details: {
				show: false,
				item: null,
			},
			store: { // a particular address's items
				show: false,
				address: "",
				items: [],
			},
			notifications: {
				// notifications for various actions
				each: [],
				nextIndex: 0,
			},
		} as ISessionContext,
		{recursive: true}
	);

	useContextProvider(SessionContext, session);

	useClientEffect$(() => {
		metamaskInit(session);
	})

	return (
		<>
			{/* min-height pushes footer down */}
			<div class="min-h-[90vh]">
				<main class="pt-20">
					<Slot />
				</main>
				{/* header and overlay are below so they stay above the content (z-index) */}
				<Header />
				<Overlay />
			</div>
			<Footer />
		</>
	);
});