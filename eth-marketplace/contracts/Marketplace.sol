// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

// convert number to string
function toString(uint256 value) pure returns (string memory) {
	// Inspired by OraclizeAPI's implementation - MIT licence
	// https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

	// next condition has not been touched by test. If I add an item with price==0, it should hit this line!
	// TODO: make a test test this. Should be done.
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

contract Marketplace {
	address payable private contractOwner;

	struct Item {
		address owner;
		string ipfsHash; // holds name, image hash, details
		uint256 price; // in wei
		bytes32 id;
	}

	mapping(address => bytes32[]) public itemIdsFromSeller; // for getting IDs from a seller
	mapping(bytes32 => Item) public itemFromId;	// for getting item from ID
	bytes32[] public arrOfItemIds; // for getting all item IDS

	constructor() {
		contractOwner = payable(msg.sender);
	}

	function withdraw(uint256 amount) external {
		require(payable(msg.sender) == contractOwner, "Not permitted to withdraw");
		
		require(address(this).balance >= amount, "can only withdraw balance that is available");
		(bool success,) = payable(msg.sender).call{value: amount}(""); // needs testing?
		require(success == true, "amount was not withdrawn" ); // needs testing?
	}

	function balance() view public returns (uint256){
		require(payable(msg.sender) == contractOwner, "Not permitted to view balance");
    return payable(address(this)).balance;
  }

	// register item to the sender/seller's address:
	function addItem(string memory _dataHash, uint256 _price) external {
		// making a unique id for the item: hash the IPFS data hash, price, sender address, and block timestamp to add a bit of "randomness" (so that creating two items with the same data result in unique ids)
		string memory price = toString(_price);
		string memory addr = toString(uint256(uint160(msg.sender)));
		string memory timestamp = toString(block.timestamp);

		bytes32 itemHashId = keccak256(abi.encodePacked(_dataHash, price, addr, timestamp));

		// create a new item
		Item memory item = Item({
			owner: msg.sender,
			ipfsHash: _dataHash,
			price: _price,
			id: itemHashId
		});

		// update our store variables
		itemIdsFromSeller[msg.sender].push(itemHashId);
		itemFromId[itemHashId] = item;
		arrOfItemIds.push(itemHashId);

		emit eventAddItem(
			item,
			arrOfItemIds.length,
			itemIdsFromSeller[msg.sender].length
		);

	}


	function sell(bytes32 _itemId) external payable {
		Item memory foundItem = itemFromId[_itemId];
		address itemOwner = foundItem.owner;
		uint256 itemPrice = foundItem.price;

		require(itemOwner != msg.sender, "Owner cannot buy their own items!");
		require(
			// msg.value >= foundItem.price,
			msg.value >= 0 && itemPrice <= msg.value,
			"Not sent enough money to buy the item"
		);

		// remove ids or items from our variables
		bool removeSuccess = removeFromAll(
			itemOwner,
			_itemId
		);
		// require below never fails with the tests, wonder if we can make it fail?
		require(
			removeSuccess,
			"Error removing item from seller's list"
		);

		// handle money transaction // not yet tsested because sale is not workingggg
		uint256 sellerProceeds = itemPrice * 95 / 100;
		address payable sellerAddr = payable(itemOwner);
		(bool success, ) = sellerAddr.call{value: sellerProceeds}("");
		// require below never fails... can we make it fail?
		require(success, "failed to send ether");

		emit eventSell(
			msg.value,
			itemPrice,
			address(this).balance,
			sellerProceeds,
			arrOfItemIds.length
		);
	}

	function deleteItem(bytes32 _itemId) external {
		Item memory foundItem = itemFromId[_itemId];
		// require here never fails in tests.. can we make it fail? I thought we did do this one.. (TODO: try to delete someone else's item)
		require(foundItem.owner == msg.sender, "Only owner can delete their item!");

		// remove ids or items from our variables
		bool removeSuccess = removeFromAll(
			foundItem.owner,
			_itemId
		);
		// TODO: make this require fail in a test
		require(
			removeSuccess,
			"Error removing item from seller's list"
		);

		emit eventDeleteItem(
			_itemId,
			foundItem.owner,
			arrOfItemIds.length
		);
	}

	function removeFromAll(address _owner, bytes32 _itemId) internal returns (bool) {
		// remove ids or items from our variables
		bool successRemoveFromSellerList = removeFromSeller(
			_owner,
			_itemId
		);
		bool successRemoveFromStockMap = removeFromStock(_itemId);
		bool successRemoveFromItemIdList = removeFromItemIds(_itemId);

		// TODO: make these requires fail in a test
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

		return true;
	}



	function removeFromStock(bytes32 _itemId) internal returns (bool) {
		// delete struct from our itemsForSale mapping
		delete itemFromId[_itemId];

		emit eventItemRemoved(_itemId);
		return true;
	}

	function getItemIndex(bytes32 _itemId, uint256 _length) internal view returns (uint256) {
		uint256 i = 0;
		for (i; i < _length; i++) {
			if (arrOfItemIds[i] == _itemId) {
				break; // saves the state of i for our return (skips increment)
			}
		}
		return i; //1 more than last index since that's what broke the loop 
	}


	function removeFromItemIds(bytes32 _itemId) internal returns (bool) {
		uint256 length = arrOfItemIds.length;
		uint256 index = getItemIndex(_itemId, length);

		// // should never run; this would happen if item had already been removed...
		// if (index == length) {
		// 	return false; // not yet tested
		// }

		// once found, shuffle our item list forward
		for (uint256 i = index; i < length - 1; i++) {
			arrOfItemIds[i] = arrOfItemIds[i + 1];
		}
		// remove the last item to reduce the length
		arrOfItemIds.pop();

		emit eventItemRemovedFromIdList(
			index,
			_itemId
		);
		return true;

	}

	function removeFromSeller(address _owner, bytes32 _itemId)
		internal
		returns (bool)
	{
		uint256 length = itemIdsFromSeller[_owner].length;
		uint256 index = getSellerItemIndex(_itemId, _owner, length);

		// // in case it's already removed for some reason? should never happen
		// if (index == length) {
		// 	return false; // not yet tested
		// }

		// reshuffle our seller's item list so we remove the item
		for (uint256 i = index; i < length - 1; i++) {
			itemIdsFromSeller[_owner][i] = itemIdsFromSeller[_owner][i + 1];
		}
		// remove the last item to reduce the length - maybe just replaces the value with default value??
		itemIdsFromSeller[_owner].pop();

		emit eventItemRemovedFromSeller(index, _itemId);

		// if (itemIdsFromSeller[_owner].length == 0) {
		// 	// no longer need seller stored
		// 	delete itemIdsFromSeller[_owner]; // not yet tested
		// }

		return true;
	}

	// use item ID to get item's index from the owner
	function getSellerItemIndex(bytes32 _itemId, address _owner, uint256 _length) internal view returns (uint256) {
		uint256 i = 0;
		for (i; i < _length; i++) {
			// this if statement never runs???
			// TODO: make a test that tests the below if statement...
			if (itemIdsFromSeller[_owner][i] == _itemId) {
				break; // saves the state of i for our return
			}
		}
		return i; //1 more than last index since that's what broke the loop 
	}
	
	// getters (not needed for public vars)
	function getAllItems() view external returns (Item[] memory) {
		uint length = arrOfItemIds.length;
		Item[] memory items = new Item[](length);
		for (uint i = 0; i < length; i++) {
			bytes32 itemId = arrOfItemIds[i];
			Item memory foundItem = itemFromId[itemId];
			items[i] = foundItem;
		}
		return items;
	}
    
	// events
	event eventAddItem(
		Item _item,
		uint256 _itemsForSaleCount,
		uint256 _sellersItemsLength
	);
	event eventSell(
		uint256 _valueSent,
		uint256 _itemPrice,
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
}