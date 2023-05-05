import {component$, Slot, useVisibleTask$, useContextProvider, useStore} from "@builder.io/qwik";
import Header from "../components/header/header";
import {SessionContext} from "~/libs/context";
import Overlay from "~/components/overlay/overlay";
import Footer from "~/components/footer/footer";
import { metamaskInit } from "~/libs/ethUtils";

export default component$(() => {
	const session = useStore<ISessionContext>(
		{
      // address of the connected wallet
			address: "", 
      // create item state
			create: {
				show: false,
				note: {
					message: "",
					class: "",
				},
			},
      // storing the items
			items: {
				all: [],
				filtered: [],
				stale: true,
				showMissing: false,
				refetch: false,
			},
      // details modal
			details: {
				show: false,
				item: null,
			},
      // a particular address's items
			store: { 
				show: false,
				address: "",
				items: [],
			},
      // notifications for various actions
			notifications: {
				each: [],
				nextIndex: 0,
			},
		},
    {deep: true}
	);

	useContextProvider(SessionContext, session);

	useVisibleTask$(async () => {
    try {
      await metamaskInit(session);
      console.log('success initing metamask');
    } catch(e) {
      console.log({e});
    }
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
