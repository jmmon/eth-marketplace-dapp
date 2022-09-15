import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0xF4A12Ff527bC99440f93ec444dB86633DB9463ff";

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
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "itemIdList",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
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
    "type": "function"
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
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getItemIdsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_id",
        "type": "bytes32"
      }
    ],
    "name": "getItemFromId",
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
        "internalType": "struct Marketplace.Item",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_sellerAddress",
        "type": "address"
      }
    ],
    "name": "getSellerItemIdsArrayFromAddress",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const CONTRACT = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};

export const connect = async ({signer}: {signer: boolean}) => {
  let provider;
  let balance;
  let accounts;

  try {
    // choose metamask injection as provider
    provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log({provider});

    // check for accounts
    accounts = await provider.send("eth_requestAccounts", []);

    // display balance for testing
    balance = ethers.utils.formatEther(await provider.getBalance(accounts[0]));

  } catch (error) {
    console.log("error getting items:", error.message);
    return Promise.reject(error);
  }

  let contract = new ethers.Contract(CONTRACT.address, CONTRACT.abi, provider);

  if (signer) {
    const signer = provider.getSigner();
    contract = contract.connect(signer);
  }

  return { accounts, balance, contract };
};



// export const ethUtils = {
//   provider: null,
//   accounts: null,
//   balance: null,
//   contract: null,
//   connect() {
//     try {
//       this.provider = new ethers.providers.Web3Provider(window.ethereum);
//     } catch(e) {
//       console.log('connect error:', e.message);
//     }
//     return this;
//   },
//   async accounts() {
//     this.accounts = new Promise(async (resolve, reject) => {
//       const accounts = await this.provider.send('eth_requestAccounts', []);
//       if (accounts.length === 0) reject(accounts); 
//       console.log('accounts', accounts);
//       resolve(accounts);
//     });
//     return this;
//   },
//   async balance() {
//     this.balance = new Promise(async (resolve, reject) => {
//       const balance = ethers.utils.formatEther(await this.provider.getBalance(accounts[0]));
//       console.log('balance', balance);
//       if (!!balance) resolve(balance);
//       reject(balance);
//     });
//     return this;
//   },
//   contract(signer: boolean) {
//     let contract = new ethers.Contract(CONTRACT.address, CONTRACT.abi, this.provider);

//     if (signer) {
//       const signer = this.provider.getSigner();
//       contract = contract.connect(signer);
//     }
//     this.contract = contract;
//     return this;
//   }
// }


/* 
register
						let obj = await ethUtils.connect().accounts()
						obj = await obj.balance();
						obj = obj.contract(true);

						addNotification(`Accounts connected: [0]:{${obj.accounts[0]}: ${obj.balance}eth}`, "success");

						const tx = await obj.contract.addItem(state.dataString, formDataObject.price);
*/