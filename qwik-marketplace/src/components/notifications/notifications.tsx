import {
	$,
	component$,
	useClientEffect$,
	useContext,
	useStore,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";

export const notificationTypes = ["success", 'warning', 'error', 'other'];
// generating notifications
export const types = ["error", "warning", "success", "other"];
export const loremSplit =
	"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Labore voluptatum, magni, eius error accusantium aliquid voluptatibus commodi at adipisci culpa consectetur vel perferendis cupiditate ullam! Id debitis sint voluptate a repellendus nihil, consectetur quas unde accusantium perspiciatis explicabo ratione reprehenderit dolores blanditiis dignissimos totam, enim praesentium quos obcaecati aliquam aliquid labore laudantium illum! Autem porro impedit cum, laborum qui quibusdam aliquid, praesentium vel at velit molestiae officiis vero quos debitis. Ducimus cum voluptatum similique quasi quia. Aliquid dignissimos vel, corporis ullam distinctio adipisci? Temporibus aut maiores, ea placeat voluptatibus laboriosam quos neque asperiores illum vel laborum dolor perferendis corrupti atque!".split(
		" "
	);

export const addNotification = $((
	session: ISessionContext,
	message: string,
	type?: NotificationTypes,
	timeout?: number,
) => {
	const thisNotification: INotificationsEach = {
		message,
		type: type ?? 3,
		id: session.notifications.nextIndex, // 1 more than last index is the new index for this notification
		timeout: timeout ?? 0,
	};
	console.log('adding notification:', thisNotification);
	// add it to our list, the rest should be handled by the notification?
	session.notifications?.each?.push(thisNotification);
	session.notifications.nextIndex++;
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
	const typeNum = Math.floor(Math.random() * 4);
	let loremNum = Math.ceil(Math.random() * 4);
	loremNum = loremNum ** 3;
	const durationNum = (typeNum < 3) ? Math.floor(Math.random() * 10) * 1000 : 0;

	// const type = types[typeNum];
	console.log(`{dur: ${durationNum}, type: ${types[typeNum]}, lorem: ${loremNum}}`);

	addNotification(session, loremSplit.slice(0, loremNum).join(" "), typeNum, durationNum);
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
			bgColor: thisNotification.type === 0
				? "bg-green-100" 
				: thisNotification.type === 1
				? "bg-orange-100"
				: thisNotification.type === 2
				? "bg-red-100"
				: "bg-blue-100",
			borderColor: thisNotification.type === 0
				? "border-green-200" 
				: thisNotification.type === 1
				? "border-orange-200"
				: thisNotification.type === 2
				? "border-red-200"
				: "border-blue-200",
			color: thisNotification.type === 0
				? "text-green-700" 
				: thisNotification.type === 1
				? "text-orange-700"
				: thisNotification.type === 2
				? "text-red-700"
				: "text-blue-700",
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
			<div 
				class={`p-2 rounded ${notification.bgColor} border-2 ${notification.borderColor} flex flex-wrap bg-opacity-70 backdrop-blur pt-1 shrink-1`}
			>
				<h3 
					class={`${notification.color} text-lg flex-grow drop-shadow-xl`}
				>
					{notificationTypes[thisNotification.type].slice(0, 1).toUpperCase().concat(notificationTypes[thisNotification.type].slice(1))}
				</h3>
				<button
					onClick$={() => remove$()}
					class="justify-self-end text-xl text-red-700 opacity-50 hover:opacity-100 hover:text-black font-bold mt-[-6px] ml-2"
				>
					X
				</button>
				<p class="w-full break-all self-start">{notification.message}</p>
			</div>
		);
	}
);

// wrapper/container
export default component$(() => {
	const session = useContext(SessionContext);
	return (
		<div class="flex flex-col gap-1 items-end w-full max-w-[600px]">
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
