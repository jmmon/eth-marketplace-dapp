declare var window: any;
import { $ } from "@builder.io/qwik";
import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x45a1009F5FFe45eFE8436A43c02137Fcd940CcBC";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          }
        ],
        "indexed": false,
        "internalType": "struct Marketplace.Item",
        "name": "_item",
        "type": "tuple"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_itemsForSaleCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_sellersItemsLength",
        "type": "uint256"
      }
    ],
    "name": "eventAddItem",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_itemId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_newItemListLength",
        "type": "uint256"
      }
    ],
    "name": "eventDeleteItem",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_removedItemId",
        "type": "bytes32"
      }
    ],
    "name": "eventItemRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_itemId",
        "type": "bytes32"
      }
    ],
    "name": "eventItemRemovedFromIdList",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "_itemId",
        "type": "bytes32"
      }
    ],
    "name": "eventItemRemovedFromSeller",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_valueSent",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_itemPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_contractBalance",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_sellerProceeds",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_remainingItemsForSale",
        "type": "uint256"
      }
    ],
    "name": "eventSell",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "arrOfItemIds",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "itemFromId",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "itemIdsFromSeller",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_dataHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      }
    ],
    "name": "addItem",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_itemId",
        "type": "bytes32"
      }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_itemId",
        "type": "bytes32"
      }
    ],
    "name": "deleteItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllItems",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          }
        ],
        "internalType": "struct Marketplace.Item[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getItemIdsLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_sellerAddress",
        "type": "address"
      }
    ],
    "name": "getItemIdsFromSeller",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

export const CONTRACT = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};

export const connect = async () => {
  let provider;
  let address;

  try {
    // choose metamask injection as provider
    console.log('connect ethUtils: new ethers.providers');
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // check for accounts
    console.log('connect ethUtils: sending "eth_requestAccounts"');
    address = (await provider.send("eth_requestAccounts", []))[0];

  } catch (error) {
    console.log("error getting items:", error.message);
    return Promise.reject(error);
  }

  return address;
};





export const getContract = async (withSigner: boolean = false) => {
  console.log('getContract: new ethers.providers');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  let contract = new ethers.Contract(CONTRACT.address, CONTRACT.abi, provider);

  if (!withSigner) {
    return contract;
  }
  try {
    console.log('getSigner()');
    const signer = await provider.getSigner();
    console.log('connect signer');
    contract = await contract.connect(signer);

  } catch (error) {
    console.log('getContract signing error:', error);
  }
  return contract;
}

export const formatItem = (item: Array<any>): IContractItem => {
  const bigNum = item[2];

  return {
    owner: item[0],
    ipfsHash: item[1],
    price: bigNum["_hex"],
    id: item[3],
  };
}

export const getItems = async (): Promise<IContractItem[]> => {
	try {
		const contract = await getContract();

		const items = await contract.getAllItems() as Array<any>;
		console.log("items from the smart contract!:", {items});
    
    const formattedItems = items.map(item => formatItem(item));
		
		console.log({formattedItems});
		return Promise.resolve(formattedItems);

	} catch (error) {
		console.log("error getting items:", error);
		return Promise.resolve([]);
	}
};

export const getItemsFromAddress = async (address: string): Promise<IContractItem[]> => {
	try {
		const contract = await getContract();

		const itemIds = await contract.getItemIdsFromSeller(address) as Array<any>;
		console.log("itemIds from the smart contract!:", {itemIds});

    // fetch each item from contract and format it
    // const items = itemIds.map(async id => )
    const formattedItemsPromises = itemIds.map(async thisId => 
      formatItem(
        await contract.itemFromId(thisId) as Array<any>
      )
    );
    console.log({formattedItemsPromises})
		const formattedItems = await Promise.all(formattedItemsPromises);
		console.log({formattedItems});
		return Promise.resolve(formattedItems);

	} catch (error) {
		console.log("error getting items:", error);
		return Promise.resolve([]);
	}
};


export const getItem = async (id: string): Promise<IContractItem> => {
	try {
		const contract = await getContract();

		const item = await contract.itemFromId(id) as Array<any>;
		console.log("item from the smart contract!:", {item});

    const formattedItem = formatItem(item);
    
		console.log({formattedItem});
		return Promise.resolve(formattedItem);

	} catch (error) {
		console.log("error getting item:", error.message);
		return Promise.reject(error);
	}
};


export const fetchItemDataFromIPFS = async (
	item: IContractItem | null,
	controller?: AbortController
): Promise<IItemData | object> => {
  if (item === null) return Promise.reject({});
	//gotta fetch the item data from IPFS... then
	// console.log('before before the url fetching itemData');
	const url = `http://localhost:8080/ipfs/${item.ipfsHash}`;
	const ipfsResponse = await fetch(url, {
		signal: controller?.signal,
	});

  const baseData = await ipfsResponse.json();
  console.log({baseData});
	const imgUrl = `http://localhost:8080/ipfs/${baseData.imgHash}`;

	const itemData = {
    ...baseData,
		owner: item.owner,
		ipfsHash: item.ipfsHash,
		id: item.id,
    imgUrl
	};

	if (itemData && typeof itemData === "object") return itemData;
	return Promise.reject({});
};


export const  onPurchase = $(async (itemData: IItemData) => {
  const address = await connect();
  const contract = await getContract(true);

  const options = {value: `${itemData.price}`};
  const tx = await contract.sell(itemData.id, options);
  console.log("response from purchase:", {tx});
  // TODO: Show some success screen?
});


// watches for metamask address changes
export const startWatchAddress = $(async (session: ISessionContext) => {
  // save initial address
  session.address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
  console.log('address:', session.address);

  const accountInterval = setInterval(async () => {
    console.log('account interval');
    // every second, check address again
    const address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];

    // while we have an initial address, if the address changes save our new address (and reload if needed);
    if (address !== session.address && session.address !== "undefined") {
      console.log('new address:', address);
      if (address === "undefined") {
        console.log('no address now, clearing address from context');
      }
      // set to undefined or new address
      session.address = address;
      // location.reload();
    }
  }, 1000);

});

export 	const handleConnect = $(async (session: ISessionContext) => {
  try {
    // check if unlocked
    console.log('checking if unlocked from handleConnect');
    const address = (await window.ethereum.request({
      method: "eth_requestAccounts",
    }))[0];

    //save address to our store
    session.unlocked = true;
    session.address = address;

    startWatchAddress(session);

  } catch (error) {
    console.log('Error connecting metamask:', error.message);
  }
});

export const addItemToMarket = $(async (state, formDataObject, session) => {
  // interact with contract
  try {
    const address = await connect();
    const contract = await getContract(true);

    const receipt = await contract.addItem(
      state.dataString,
      formDataObject.price
    );

    session.staleItems = true; // refetch items

    console.log("response from addItem:", {receipt});
    const jsonTx = JSON.stringify(receipt);
    console.log("item added to dapp!:", jsonTx);
    return {data: jsonTx, err: null};
    
  } catch (e) {
    return {data: null, err: e};
  }
});

export const ETH_CONVERSION_RATIOS = {
  eth: 10**18,
  gwei: 10**9,
  wei: 1,
}