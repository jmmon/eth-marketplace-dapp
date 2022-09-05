import {
	component$,
	Slot,
	useClientEffect$,
	useContextProvider,
	useStore,
} from "@builder.io/qwik";
import {RequestHandler, useEndpoint} from "@builder.io/qwik-city";
import {SessionContext} from "~/libs/context";
import {getSession} from "~/libs/getSession";
import Footer from "../components/footer/footer";
import Header from "../components/header/header";

export interface EndpointData {
  user?: object; // schema of user
}

export const onGet: RequestHandler<EndpointData> = ({request}) => {
	const {user} = getSession(request.headers.get("cookie"));
	return {
		user,
	};
};

export default component$(() => {
	const resource = useEndpoint<typeof onGet>();
	const session = useStore({
		loaded: false,
		user: undefined,
	} as any);
	useContextProvider(SessionContext, session);
	useClientEffect$(() => {
		resource.promise
			.then((data: any) => {
				session.user = data?.user;
				session.loaded = true;
			})
			.catch((error: any) => {
				session.loaded = true;
			});
	});

	return (
		<div>
			<Header />
			<main>
				<Slot />
			</main>
			<Footer />
		</div>
	);
});
