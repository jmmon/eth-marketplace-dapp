declare var window: any;
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { CONTRACT, ETH_CONVERSION_RATIOS } from "./constants";
import { IPFS_FETCH_URL } from "./ipfs";

export const convertPriceFromWei = (
  units: String,
  price: String,
): string => {
  // console.log('convertPriceFromWei:', {units, price});
  return String(+price / ETH_CONVERSION_RATIOS[units])
};

export const convertPriceToWei = (
  units: String,
  price: String,
): string => {
  // console.log('convertPriceToWei:', {units, price});
  return String(+price * ETH_CONVERSION_RATIOS[units]);
}

export const connect = async () => {
  let provider;
  let address;

  try {
    // choose metamask injection as provider
    console.log("connect ethUtils: new ethers.providers");
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // check for accounts
    console.log('connect ethUtils: sending "eth_requestAccounts"');
    address = (await provider.send("eth_requestAccounts", []))[0];
  } catch (error) {
    console.log("Error connecting to Metamask:", error.message);
    return Promise.reject(error);
  }

  return address;
};

export const getContract = async (withSigner: boolean = false) => {
  // console.log(`getContract: ${withSigner ? "with" : "without"} signer`);
  let provider;
  let contract;
  try {
    // Provider: should use Infura soon; want to make sure items display even if metamask is not installed for the user!!!
    provider = new ethers.providers.Web3Provider(window.ethereum);
    contract = new ethers.Contract(CONTRACT.address, CONTRACT.abi, provider);
  } catch (error) {
    console.log("Error getting provider:", error.message);
    return null;
  }

  if (!withSigner) {
    return contract;
  }

  try {
    contract = await contract.connect(await provider.getSigner());
  } catch (error) {
    console.log("getContract signing error:", error);
  }
  return contract;
};

export const formatItem = (item: Array<any>): IContractItem => {
  const bigNum = item[2];

  return {
    owner: item[0],
    ipfsHash: item[1],
    price: bigNum["_hex"],
    id: item[3],
  };
};

export const getItems = async (): Promise<{
  items: IContractItem[];
  error?: any;
}> => {
  let contract;

  try {
    contract = await getContract();

  } catch (error) {
    console.log("error getting contract:", error);
    return { items: Promise.resolve([]), error };
  }

  try {
    const items = (await contract.getAllItems()) as Array<any>;

    const formattedItems = items?.map((item) => formatItem(item));

    return { items: formattedItems, error: null };

  } catch (error) {
    console.log("error running getAllItems method on contract:", error);
    return { items: Promise.resolve([]), error };
  }
};

export const itemDataFromIPFS = async (
  item: IContractItem | null,
  controller?: AbortController
): Promise<IItemData> => {
  if (item === null) return Promise.reject({});
  if (!item.ipfsHash) return Promise.reject({});

  const url = `${IPFS_FETCH_URL}${item.ipfsHash}`;

  const baseData = await (
    await fetch(url, {
      signal: controller?.signal,
    })
  ).json();

  const imgUrl = `${IPFS_FETCH_URL}${baseData.imgHash}`;

  const itemData = {
    ...baseData,
    owner: item.owner,
    ipfsHash: item.ipfsHash,
    id: item.id,
    imgUrl,
  };

  if (itemData && typeof itemData === "object") return itemData;
  console.log("rejected");
  return Promise.reject(itemData);
};

export const sellItem = async (
  itemData: IItemData
): Promise<{ success: boolean; error: { message: string } | null }> => {
  try {
    const contract = await getContract(true);
    const options = { value: `${itemData.price}` };

    const response = await contract.sell(itemData.id, options);
    console.log("response from purchase:", { response });
    return { success: true, error: null };
  } catch (error) {
    console.log("error from purchase:", error.message);
    return { success: false, error };
  }
};

export const deleteItem = async (
  itemData: IItemData
): Promise<{ success: boolean; error: { message: string } | null }> => {
  try {
    const contract = await getContract(true);

    const response = await contract.deleteItem(itemData.id);
    console.log("response from purchase:", { response });
    return { success: true, error: null };
  } catch (error) {
    console.log("error from delete:", error.message);
    return { success: false, error };
  }
};

// // watches for metamask address changes
// export const maintainSameAddress = async (session: ISessionContext) => {
//   // every second, check address again
//   const accountInterval = setInterval(async () => {
//     const newAddress = (
//       await window.ethereum.request({ method: "eth_accounts" })
//     )[0];

//     if (newAddress !== session.address) {
//       console.log("New address:", newAddress);

//       session.address = newAddress;
//       session.items.stale = true; // refetch in case
//     }
//   }, 1000);
// };

export const connectMetamask = async (session: ISessionContext) => {
  try {
    // check if unlocked
    console.log("checking if unlocked from connectMetamask");
    const address = (
      await window?.ethereum.request({
        method: "eth_requestAccounts",
      })
    )[0];

    //save address to our store
    session.address = address;
    console.log("initial address:", session.address);

    // maintainSameAddress(session);
  } catch (error) {
    console.log("Error connecting metamask:", error.message);
    return error;
  }
};

export const addItemToMarket = async (
  state: ICreateFormState,
  formDataObject: ICreateFormDataObject,
  session: ISessionContext
) => {
  // interact with contract
  try {
    const contract = await getContract(true);

    const receipt = await contract.addItem(
      state.dataString,
      formDataObject.price
    );

    console.log("item added to dapp! response from addItem:", { receipt });
    const jsonTx = JSON.stringify(receipt);
    return { data: jsonTx, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// new metamask connections function:
// useClientEffect:

export const metamaskInit = async (session: ISessionContext) => {
  const provider = await detectEthereumProvider();
  console.log({ provider });

  if (provider) {
    /************************************************ */
    /* detect chainID, handle change chainId          */
    /************************************************ */
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chainId:", chainId);

    ethereum.on("chainChanged", function (networkId) {
      console.log(
        "Metamask network has changed! Old network:",
        chainId,
        "\nNew network ID:",
        networkId
      );
      chainId = networkId;
      session.items.stale = true; // refetch in case
    });

    /************************************************ */
    /* handle change accounts                         */
    /************************************************ */

    console.log("checking if unlocked from connectMetamask");

    ethereum.on("accountsChanged", function (accounts) {
      if (accounts.length === 0) {
        session.address = "";
        console.log("Please connect metamask");
      } else if (accounts[0] !== session.address) {
        console.log("switching accounts to ", accounts[0] + "...");
        session.address = accounts[0];
        session.items.stale = true; // refetch in case
      }
    });
  } else {
    // could connect to fallback network;
    console.warn("No web3 detected, please install Metamask!");
    return new Error("Error detecting Metamask: Please install Metamask!");
  }
};
