import {
	$,
	component$,
	useTask$,
	useContext,
	useSignal,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";

const NOTIFICATION_COLORS: {
  [key: string]: {
    color: string;
    bg: string;
    border: string;
    text: string;
    hover: string;
  };
} = {
	success: {
      color: "green",
      bg: '100',
      border: '200',
      text: '700',
      hover: '50',
    },
	warning: {
      color: "amber",
      bg: '100',
      border: '200',
      text: '700',
      hover: '50',
    },
	error: {
      color: "red",
      bg: '200',
      border: '300',
      text: '700',
      hover: '100',
    },
	info: {
      color: "blue",
      bg: '100',
      border: '200',
      text: '800',
      hover: '50',
    },
};
const getColor = (type: NotificationTypes, location: 'bg' | 'border' | 'text', hover: boolean = false) => {
  return `${hover ? 'hover:' : ''}${location}-${NOTIFICATION_COLORS[type].color}-${NOTIFICATION_COLORS[type][hover ? "hover" : location]}`
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
		timeout: number = 0
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
	const remaining = session.notifications.each.filter((n) => n.id !== id) ?? [];

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

	console.log(`{dur: ${durationNum}, type: ${type}, lorem: ${loremNum}}`);

	addNotification(
		session,
		LOREM_SPLIT.slice(0, loremNum).join(" "),
		type,
		durationNum
	);
});

interface NotificationProps {
	thisNotification: INotificationsEach;
	remove$: () => void;
}
export const Notification = component$(
	({thisNotification, remove$}: NotificationProps) => {
		const notification = useSignal({
      //type: thisNotification.type,
      //message: thisNotification.message,
      //timeout: thisNotification.timeout,
      ...thisNotification,
      colors: {
        bg: getColor(thisNotification.type, 'bg'),
        bgHover: getColor(thisNotification.type, 'bg', true) ?? '',
        border: getColor(thisNotification.type, 'border'),
        text: getColor(thisNotification.type, 'text'),
      }
		});
		console.log("Notification render:", {colors: notification.value.colors});

		useTask$(() => {
			if (notification.value.timeout === 0) return;

			const timer = setTimeout(() => {
				remove$();
			}, notification.value.timeout);

			return () => clearTimeout(timer);
		});

		return (
			<div
				class={`p-2 rounded ${notification.value.colors.bg}  border-solid border-2 ${notification.value.colors.border} flex flex-wrap bg-opacity-60 hover:bg-opacity-90 backdrop-blur pt-1 shrink-1`}
			>
				<h3
					class={`${notification.value.colors.text} text-lg flex-grow drop-shadow-xl`}
				>
					{capitalizeFirstLetter(notification.value.type)}
				</h3>
				<button
					onClick$={remove$}
					class="justify-self-end text-xl text-red-700 opacity-50 hover:opacity-100 hover:text-black font-bold mt-[-6px] ml-2"
				>
					X
				</button>
				<p class="w-full break-all self-start">{notification.value.message}</p>
			</div>
		);
	}
);

// wrapper/container
export default component$(() => {
	const session = useContext(SessionContext);
	return (
		<div class="flex flex-col gap-1 items-end w-full max-w-[600px]">
			{session.notifications.each.map((thisNotification) => (
				<Notification
					key={thisNotification.id}
					thisNotification={thisNotification}
					remove$={() => {
						console.log("removing notification");
						removeNotification(session, thisNotification.id);
					}}
				/>
			))}
		</div>
	);
});
