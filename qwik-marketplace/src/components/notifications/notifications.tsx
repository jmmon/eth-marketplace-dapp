import {
	$,
	component$,
	useClientEffect$,
	useContext,
	useStore,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";

// export const notificationsContext = createContext('notifications-context');

// generating notifications
export const types = ["error", "warning", "success", ""];
export const loremSplit =
	"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Labore voluptatum, magni, eius error accusantium aliquid voluptatibus commodi at adipisci culpa consectetur vel perferendis cupiditate ullam! Id debitis sint voluptate a repellendus nihil, consectetur quas unde accusantium perspiciatis explicabo ratione reprehenderit dolores blanditiis dignissimos totam, enim praesentium quos obcaecati aliquam aliquid labore laudantium illum! Autem porro impedit cum, laborum qui quibusdam aliquid, praesentium vel at velit molestiae officiis vero quos debitis. Ducimus cum voluptatum similique quasi quia. Aliquid dignissimos vel, corporis ullam distinctio adipisci? Temporibus aut maiores, ea placeat voluptatibus laboriosam quos neque asperiores illum vel laborum dolor perferendis corrupti atque!".split(
		" "
	);

export const addNotification = $((
	session: ISessionContext,
	message: string,
	type?: string,
	timeout?: number,
) => {
	const notifications = session.notifications;

	const index = notifications.nextIndex;
	const thisNotification: INotificationsEach = {
		message,
		type: type ?? "",
		id: index, // 1 more than last index is the new index for this notification
		timeout: timeout ?? 0,
	};
	// add it to our list, the rest should be handled by the notification?
	notifications?.each?.push(thisNotification);
	notifications.nextIndex++;
});

export const removeNotification = $((session: ISessionContext, id: number ) => {
	const notifications = session.notifications;

	const remainingAsMatrix = notifications.each?.filter((n) => n.id !== id) ?? null;

	// reset our store and currentIndex
	if (remainingAsMatrix?.length === 0 || remainingAsMatrix === null) {
		notifications.each = [];
		notifications.nextIndex = 0;
		return;
	}

	session.notifications.each = remainingAsMatrix;
});

export const generateNotification = $((session: ISessionContext) => {
	const typeNum = Math.floor(Math.random() * 3);
	const loremNum = Math.floor(Math.random() * 99);
	const durationNum = Math.floor(Math.random() * 10) * 1000;

	const type = types[typeNum];
	console.log(`{dur: ${durationNum}, type: ${type}, lorem: ${loremNum}}`);

	addNotification(session, loremSplit.slice(0, loremNum).join(" "), type, durationNum);
});

export const Notification = component$(
	({
		thisNotification,
		remove$,
	}: {
		thisNotification: INotificationsEach;
		remove$: () => void;
	}) => {
		const notification = useStore({
			...thisNotification,
			bgColor: `bg-${
				thisNotification.type === "error"
					? "red"
					: thisNotification.type === "warning"
					? "orange"
					: thisNotification.type === "success"
					? "green"
					: "blue"
			}-200`,
		});

		useClientEffect$(() => {
			if (notification.timeout === 0 || !notification.timeout) return;

			const timer = setTimeout(() => {
				remove$();
				console.log('removing notification')
			}, notification.timeout);

			return () => clearTimeout(timer);
		});

		return (
			<div class={`w-[600px] rounded ${notification.bgColor} flex flex-col`}>
				<button
					onClick$={() => remove$()}
					class="self-end text-red-600 hover:text-black"
				>
					X
				</button>
				<p class="break-all self-start">{notification.message}</p>
			</div>
		);
	}
);

export const Notifications = component$(() => {
	const session = useContext(SessionContext);
	// const store = useStore({
	// 	notifications: [],
	// 	nextIndex: 0,
	// });
	return (
		<div class="grid grid-cols-1 gap-2">
			<button onClick$={() => generateNotification(session)}>Create notification</button>
			{session.notifications.each?.map((thisNotification) => (
				<Notification
					key={thisNotification.id}
					thisNotification={thisNotification}
					remove$={() => removeNotification(session, thisNotification.id)}
				/>
			))}
		</div>
	);
});
