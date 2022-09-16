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





export const getContract = async (withSigner = false as boolean) => {
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

export const formatItem = (item: IItem): IItem => {
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

		const items = await contract.getAllItems();
		console.log("items from the smart contract!:", {items});
    
    const formattedItems = items.map(item => formatItem(item));
		
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

		const item = await contract.itemFromId(id);
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
	item: IContractItem,
	controller?: AbortController
): Promise<IItemData> => {
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
	return Promise.reject(itemData);
};
