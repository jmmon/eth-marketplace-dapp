import {
	$,
	component$,
	useVisibleTask$,
	useContext,
	useStore,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";

const NOTIFICATION_COLORS: {
  [key: string]: string;
} = {
  success: "green",
  warning: "yellow",
  error: "red",
  info: "blue",
}
// generating notifications
const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_COLORS);
export const LOREM_SPLIT =
	"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Labore voluptatum, magni, eius error accusantium aliquid voluptatibus commodi at adipisci culpa consectetur vel perferendis cupiditate ullam! Id debitis sint voluptate a repellendus nihil, consectetur quas unde accusantium perspiciatis explicabo ratione reprehenderit dolores blanditiis dignissimos totam, enim praesentium quos obcaecati aliquam aliquid labore laudantium illum! Autem porro impedit cum, laborum qui quibusdam aliquid, praesentium vel at velit molestiae officiis vero quos debitis. Ducimus cum voluptatum similique quasi quia. Aliquid dignissimos vel, corporis ullam distinctio adipisci? Temporibus aut maiores, ea placeat voluptatibus laboriosam quos neque asperiores illum vel laborum dolor perferendis corrupti atque!".split(
		" "
	);


const capitalizeFirstLetter = (s: string) =>
	s[0].toUpperCase().concat(s.slice(1));

// creates a notification and adds it to the app session
export const addNotification = $(
	(
		session: ISessionContext,
		message: string,
		type: NotificationTypes = "info",
		timeout: number = 0,
	) => {
		const thisNotification: INotificationsEach = {
			message,
			type,
			id: session.notifications.nextIndex, // 1 more than last index is the new index for this notification
			timeout,
		};
		console.log("adding notification:", thisNotification);
		// add it to our list, the rest should be handled by the notification?
		session.notifications.each.push(thisNotification);
		session.notifications.nextIndex++; // update for the next time
	}
);

export const removeNotification = $((session: ISessionContext, id: number) => {
	const remaining =
		session.notifications.each.filter((n) => n.id !== id) ?? [];

	if (remaining.length > 0) {
    session.notifications.each = remaining;
		return;
	}

  // if none left, reset our store and currentIndex
  session.notifications.each = [];
  session.notifications.nextIndex = 0;
});

export const generateNotification = $((session: ISessionContext) => {
	const typeNum = Math.floor(Math.random() * 4);
	const loremNum = Math.ceil(Math.random() * 4) ** 3;
	const durationNum = typeNum < 3 ? Math.floor(Math.random() * 10) * 1000 : 0;

  const type = NOTIFICATION_TYPES[typeNum] as NotificationTypes;

	console.log(
		`{dur: ${durationNum}, type: ${type}, lorem: ${loremNum}}`
	);

	addNotification(
		session,
		LOREM_SPLIT.slice(0, loremNum).join(" "),
    type,
		durationNum,
	);
});


interface NotificationProps {
	thisNotification: INotificationsEach;
	remove$: () => void;
}
export const Notification = component$(
	({thisNotification, remove$}: NotificationProps) => {
		const type = thisNotification.type;
    const color = NOTIFICATION_COLORS[type];
    console.log({color});
		const notification = useStore({
			...thisNotification,
      color,
		});

		useVisibleTask$(() => {
			if (notification.timeout === 0 || !notification.timeout) return;

			const timer = setTimeout(() => {
				remove$();
				console.log("removing notification");
			}, notification.timeout);

			return () => clearTimeout(timer);
		});

		return (
			<div
        class={`p-2 rounded bg-${notification.color}-100 hover:bg-${notification.color}-50 border-solid border-2 border-${notification.color}-200 flex flex-wrap bg-opacity-70 backdrop-blur pt-1 shrink-1`}
			>
				<h3 class={`text-${notification.color}-700 text-lg flex-grow drop-shadow-xl`}>
					{capitalizeFirstLetter(type)}
				</h3>
				<button
					onClick$={remove$}
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
