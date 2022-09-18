
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

type NotificationTypes = Readonly<["success", "warning", "error", "other"]>

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
	name: string;
	description: string;
	imgHash: string | undefined;
}


// declare interface IItemFromContract {

// }