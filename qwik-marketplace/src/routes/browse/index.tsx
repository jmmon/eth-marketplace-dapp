import {component$, Resource, useClientEffect$, useResource$, useStyles$} from "@builder.io/qwik";
import { useEndpoint } from "@builder.io/qwik-city";

interface IItem {
	owner: string;
	ipfsHash: string;
	price: string | number;
 	id: string;
}


export default component$(() => {
	// check for account info
	// useClientEffect$(() => {});

	useStyles$(`.itemsContainer {
		display: flex; 
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem; 
		font-size: 20px;
		margin: 1.5rem;
	}`);

	const arrayOfItemShells = useEndpoint<IItem[]>();
	console.log('arrayOfItemShells:', arrayOfItemShells);

	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				<Resource 
					value={arrayOfItemShells}
					onResolved={(items) => 
						(items.map((item) => (
							// display array of item components
							<Item item={item}/>
						)))}
				/>
			</div>
		</div>
	);
});

export const onGet: RequestHandler<IItem[]> = async () => {
	//temporary fetch from my own api endpoint instead of smart contract
	const fetchedItems = await fetch(`http://127.0.0.1:5174/api/marketplace/dummyItems`)
	const array: IItem[] = await fetchedItems.json();
	console.log(`browse request handler runs`);
	console.log('array', array);
	return array;
}

interface IItemData {
	price: string;
	name: string;
	description: string;
	imgHash: string;
}


export const Item = component$((props: {item: IItem}) => {
	useStyles$(`.item {
	}`);


	const resource = useResource$<IItemData>(async ({track}) => {
		track(props, "item");
		
		//gotta fetch the item data from IPFS... then 
		const url = `http://localhost:8080/ipfs/${props.item.ipfsHash}`;
		const response = await fetch(url);
		// can render img from localhost gateway?
		const itemData = await response.json();
		console.log('item useResource itemData:', {itemData})
		return itemData;
	});

	return (
			<Resource
				value={resource}
				onResolved={( itemData: IItemData ) => {
					console.log(' this item:', {itemData});
					const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`
					return (
					<div class="item p-2 m-2 flex flex-wrap flex-col flex-1 items-center text-lg text-white text-left bg-blue-400 gap-1 w-4/12">
						{/* <img src={imgUrl} alt={itemData.name} style="height: 300px;"/> */}
						<div style={`background: url(${imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 300px; width: 100%;`}></div>
						<h3 class='text-4xl'>{itemData.name}</h3>
						<span>{itemData.price} wei</span>
						<p>{itemData.description.slice(0, itemData.description.length > 30 ? 20 : itemData.description.length * 2 / 3).trim().concat('...')}</p> 
						<a class="border rounded bg-gray-100" href={`/browse/${props.item.id}`}>Details</a>
					</div>
				)}}
			/>
	);
});

