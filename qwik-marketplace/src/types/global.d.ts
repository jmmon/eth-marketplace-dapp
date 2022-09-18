
declare interface IContractItem {
	owner: string;
	ipfsHash: string;
	price: string | number | object;
 	id: string;
}

declare interface IItemData {
	price: string;
	name: string;
	description: string;
	imgHash: string;
	owner: string;
	ipfsHash: string;
	id: string;
	imgUrl: string;
}

declare interface INotifications {
	each: INotificationsEach[] | null;
	nextIndex: number;
}

type NotificationTypes = Readonly<["success", "warning", "error", "other"]> | number | undefined

declare interface INotificationsEach {
	message: string;
	type: NotificationTypes;
	id: number;
	timeout: number;
}

declare interface ISessionContext {
	address?: string;
	unlocked?: boolean;
	isBrowser?: boolean;
	items: IContractItem[];
	staleItems: boolean;
	details: {
		show: boolean;
		item: IContractItem | null;
	};
	store: {
		show: boolean;
		address: string;
		items: IContractItem[] | null;
	};
	notifications: INotifications;
}

declare interface ICreateFormState {
	price: string | number | undefined;
	imageString: string;
	dataString: string;
}

declare interface ICreateFormDataObject {
	price: string | number;
	units: string;
	name: string;
	description: string;
	imgHash: string | undefined;
	[key: string]: string | number | undefined | File;
}


// declare interface IItemFromContract {

// }