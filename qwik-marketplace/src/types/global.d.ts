type window = any;

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


type NotificationTypes = Readonly<["success", "warning", "error", "other"]> | number | undefined

declare interface INotificationsEach {
	message: string;
	type: NotificationTypes;
	id: number;
	timeout: number;
}

declare interface ISessionContext {
	address: string;
	create: {
		show: boolean;
		note: {
			message: string;
			class: string;
		};
	};
	items: {
		all: IContractItem[];
		filtered: IContractItem[];
		stale: boolean;
		showMissing: boolean;
	}
	details: {
		show: boolean;
		item: IContractItem | null;
	};
	store: {
		show: boolean;
		address: string;
		items: IContractItem[] | null;
	};
	notifications: {
		each: INotificationsEach[];
		nextIndex: number;
	};
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