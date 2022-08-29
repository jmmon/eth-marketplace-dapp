// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

// convert number to string
function toString(uint256 value) pure returns (string memory) {
	// Inspired by OraclizeAPI's implementation - MIT licence
	// https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

	if (value == 0) {
		return "0";
	}
	uint256 temp = value;
	uint256 digits;
	while (temp != 0) {
		digits++;
		temp /= 10;
	}
	bytes memory buffer = new bytes(digits);
	while (value != 0) {
		digits -= 1;
		buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
		value /= 10;
	}
	return string(buffer);
}

// sellers register/list items for sale in the ethereum blockchain
// item == hash of IPFS JSON Object
// smart contract has a collection of sellers, and each seller has a collection of items

// visitors DO NOT see sellers' address/contacts
// visitors can register as buyers if they have a wallet (metamask)
// Buyers can buy; payment goes to smart contract, then 95% goes to the seller ?

// "buyers" registration can be app logic; smart contract does not need to keep
//      a list of registered buyers

contract Marketplace {
	address payable private contractOwner;

	mapping(address => bytes32[]) itemIdsFromSeller; // for getting IDs from a seller
	mapping(bytes32 => Item) itemFromId;	// for getting item from ID
	bytes32[] public itemIdList; // for getting all item IDS

	struct Item {
		address owner;
		string ipfsHash; // holds name, image hash, details
		uint256 price; // in wei
		bytes32 id;
	}

	// events
	event eventRegisterItem(
		Item _item,
		uint256 _itemsForSaleCount,
		uint256 _sellersItemsLength
	);
	event eventSellItem(
		uint256 _contractBalance,
		uint256 _sellerProceeds,
		uint256 _remainingItemsForSale
	);
	event eventItemRemoved(bytes32 _removedItemId);
	event eventItemRemovedFromSeller(uint256 _index, bytes32 _itemId);
	event eventItemRemovedFromIdList(uint256 _index, bytes32 _itemId);
		event eventDeleteItem(
		bytes32 _itemId,
		address _owner,
		uint256 _newItemListLength
	);

	constructor() {
		contractOwner = payable(msg.sender);
	}

	// getters
	function getForSaleItemIds() public view returns (bytes32[] memory) {
		return itemIdList;
	}

	function getForSaleItemIdsCount() public view returns (uint256) {
		return itemIdList.length;
	}

	function getItemById(bytes32 _id) public view returns (Item memory) {
		return itemFromId[_id];
	}

	function getForSaleItemIdsFromSeller(address _sellerAddress)
	  view public
		returns (bytes32[] memory)
	{
		return itemIdsFromSeller[_sellerAddress];
	}

	// register item to the sender/seller's address:
	function registerItemForSale(string memory _dataHash, uint256 _price) public returns (bool success) {
		// making an id for the item: hash the IPFS data hash, price, and sender address
		string memory itemData = string.concat(
			_dataHash,
			toString(_price),
			toString(uint256(uint160(msg.sender)))
		);
		bytes32 itemHashId = keccak256(abi.encodePacked(itemData));

		// create a new item
		Item memory item = Item({
			owner: msg.sender,
			ipfsHash: _dataHash,
			price: _price, // not needed? saved in the ipfs upload so comes with the rest of the data
			id: itemHashId
		});

		// push the itemHashId to our seller's list of items
		itemIdsFromSeller[msg.sender].push(itemHashId);

		// add {itemHashId: item} to our itemFromId (list of all items for sale)
		itemFromId[itemHashId] = item;

		//push to itemIdList, our list of all items
		itemIdList.push(itemHashId);

		emit eventRegisterItem(
			item,
			itemIdList.length,
			itemIdsFromSeller[msg.sender].length
		);

		return true;
	}


	function sellItem(bytes32 _itemId) public payable {
		Item memory foundItem = itemFromId[_itemId];
		require(foundItem.owner != msg.sender, "Owner cannot buy their own items!");
		require(
			msg.value >= foundItem.price,
			"Not sent enough money to buy the item"
		);

		// remove id from seller's items list
		bool successRemoveFromSellerList = removeItemFromSellerItemIds(
			foundItem.owner,
			_itemId
		);

		// remove item from our mapping
		bool successRemoveFromStockMap = removeItemFromStockList(_itemId);

		// remove item from our itemIdList
		bool successRemoveFromItemIdList = removeItemFromItemsList(_itemId);

		require(
			successRemoveFromSellerList,
			"Error removing item from seller's list"
		);
		require(
			successRemoveFromStockMap,
			"Error removing item from stock items"
		);
		require(
			successRemoveFromItemIdList,
			"Error removing item from item id list"
		);

		uint256 sellerProceeds = (foundItem.price * 95) / 100;

		(bool success, ) = foundItem.owner.call{value: sellerProceeds}("");
		require(success, "failed to send ether"); // what happens if this fails?? item still gets removed, but seller does not get proceeds I guess?? Or maybe it cancels the whole function, don't remember


		emit eventSellItem(
			address(this).balance,
			sellerProceeds,
			itemIdList.length
		);
	}

	function ownerDeleteItem(bytes32 _itemId) public {
		Item memory foundItem = itemFromId[_itemId];
		require(foundItem.owner == msg.sender, "Only owner can delete their item!");

		// remove id from seller's items list
		bool successRemoveFromSellerList = removeItemFromSellerItemIds(
			foundItem.owner,
			_itemId
		);

		// remove item from our mapping
		bool successRemoveFromStockMap = removeItemFromStockList(_itemId);

		// remove item from our itemIdList
		bool successRemoveFromItemIdList = removeItemFromItemsList(_itemId);

		require(
			successRemoveFromSellerList,
			"Error removing item from seller's list"
		);
		require(
			successRemoveFromStockMap,
			"Error removing item from stock items"
		);
		require(
			successRemoveFromItemIdList,
			"Error removing item from item id list"
		);


		emit eventDeleteItem(
			_itemId,
			foundItem.owner,
			itemIdList.length
		);
	}



	function removeItemFromStockList(bytes32 _itemId) internal returns (bool) {
		// delete struct from our itemsForSale mapping
		delete itemFromId[_itemId];

		emit eventItemRemoved(_itemId);
		return true;
	}

	function getItemIndex(bytes32 _itemId, uint256 _length) internal view returns (uint256) {
		uint256 i = 0;
		for (i; i < _length; i++) {
			if (itemIdList[i] == _itemId) {
				break; // saves the state of i for our return (skips increment)
			}
		}
		return i; //1 more than last index since that's what broke the loop 
	}


	function removeItemFromItemsList(bytes32 _itemId) internal returns (bool) {
		uint256 length = itemIdList.length;
		uint256 index = getItemIndex(_itemId, length);

		if (index == length) {
			return false;
		}

		// once found, shuffle our item list forward
		for (uint256 i = index; i < length - 1; i++) {
			itemIdList[i] = itemIdList[i + 1];
		}
		// remove the last item to reduce the length
		itemIdList.pop();

		emit eventItemRemovedFromIdList(
			index,
			_itemId
		);
		return true;


		// // find our item by id
		// uint256 itemIdListLength = itemIdList.length;
		// for (uint256 i = 0; i < itemIdListLength; i++) {
		// 	if (itemIdList[i] == _itemId) {
		// 		uint256 itemIdLocation = i;

		// 		// once found, shuffle our item list forward
		// 		for (i; i < itemIdListLength - 1; i++) {
		// 			itemIdList[i] = itemIdList[i + 1];
		// 		}
		// 		// remove the last item to reduce the length
		// 		itemIdList.pop();

		// 		emit eventItemRemovedFromIdList(
		// 			itemIdLocation,
		// 			_itemId
		// 		);
		// 		return true;

		// 	}
		// }
		// return false;
	}


	function getSellerItemIndex(bytes32 _itemId, address _owner, uint256 _length) internal view returns (uint256) {
		uint256 i = 0;
		for (i; i < _length; i++) {
			if (itemIdsFromSeller[_owner][i] == _itemId) {
				break; // saves the state of i for our return
			}
		}
		return i; //1 more than last index since that's what broke the loop 
	}

	function removeItemFromSellerItemIds(address _owner, bytes32 _itemId)
		internal
		returns (bool)
	{
		uint256 length = itemIdsFromSeller[_owner].length;
		uint256 index = getSellerItemIndex(_itemId, _owner, length);

		if (index == length) {
			return false;
		}

		// reshuffle our seller's item list so we remove the item
		for (uint256 i = index; i < length - 1; i++) {
			itemIdsFromSeller[_owner][i] = itemIdsFromSeller[_owner][i + 1];
		}
		// remove the last item to reduce the length
		itemIdsFromSeller[_owner].pop();

		emit eventItemRemovedFromSeller(index, _itemId);

		if (itemIdsFromSeller[_owner].length == 0) {
			// no longer need seller stored
			delete itemIdsFromSeller[_owner];
		}

		return true;



		// // find our item in our seller's list
		// uint256 sellerItemsLength = itemIdsFromSeller[_owner].length;
		// for (uint256 i = 0; i < sellerItemsLength; i++) {
		// 	if (itemIdsFromSeller[_owner][i] == _itemId) {
		// 		uint256 itemIdLocation = i;

		// 		// reshuffle our seller's item list so we remove the item
		// 		for (i; i < sellerItemsLength - 1; i++) {
		// 			itemIdsFromSeller[_owner][i] = itemIdsFromSeller[_owner][i + 1];
		// 		}
		// 		// remove the last item to reduce the length
		// 		itemIdsFromSeller[_owner].pop();

		// 		emit eventItemRemovedFromSeller(itemIdLocation, _itemId);

		// 		return true;
		// 	}
		// }

		// // return if not found;
		// return false;
	}
}

/* NOTES:


*/
