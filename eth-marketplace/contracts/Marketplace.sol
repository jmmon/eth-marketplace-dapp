// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

// import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

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

contract Marketplace {
	address payable private contractOwner;

	struct Item {
		address owner;
		string ipfsHash; // holds name, image hash, details
		uint256 price; // in wei
		bytes32 id;
	}

	mapping(address => bytes32[]) public itemIdsFromSeller; // for getting IDs from a seller
	mapping(bytes32 => Item) public itemFromId; // for getting item from ID
	bytes32[] public arrOfItemIds; // for getting all item IDS

	constructor() {
		contractOwner = payable(msg.sender);
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
	event eventItemRemovedFromStock(bytes32 _removedItemId);
	event eventItemRemovedFromSeller(uint256 _index, bytes32 _itemId);
	event eventItemRemovedFromIdList(uint256 _index, bytes32 _itemId);
	event eventDeleteItem(
		bytes32 _itemId,
		address _owner,
		uint256 _newItemListLength
	);

	//////////////////////////////////////////////////////
	//
	// helpers / getters
	//
	//////////////////////////////////////////////////////

	function getAllItems() external view returns (Item[] memory) {
		uint256 length = arrOfItemIds.length;
		Item[] memory items = new Item[](length);
		for (uint256 i = 0; i < length; i++) {
			bytes32 itemId = arrOfItemIds[i];
			Item memory foundItem = itemFromId[itemId];
			items[i] = foundItem;
		}
		return items;
	}

	function withdraw(uint256 amount) external {
		require(payable(msg.sender) == contractOwner, "Not permitted to withdraw");

		require(
			address(this).balance >= amount,
			"can only withdraw balance that is available"
		);

		// TODO: cover this branch with test
		(bool success, ) = payable(msg.sender).call{value: amount}("");
		require(success == true, "amount was not withdrawn");
	}

	// probably not needed except for easier access
	function balance() public view returns (uint256) {
		require(
			payable(msg.sender) == contractOwner,
			"Not permitted to view balance"
		);
		return payable(address(this)).balance;
	}

	//////////////////////////////////////////////////////
	//
	// main functions
	//
	//////////////////////////////////////////////////////

	// register item to the sender/seller's address:
	function addItem(string memory _dataHash, uint256 _price) external {
		string memory price = toString(_price);
		string memory addr = toString(uint256(uint160(msg.sender)));
		string memory timestamp = toString(block.timestamp); //for uniqueness

		// hashing to make a unique id for the item:
		bytes32 itemUniqueHashId = keccak256(
			abi.encodePacked(_dataHash, price, addr, timestamp)
		);

		Item memory item = Item({
			owner: msg.sender,
			// owner: _msgSender(),
			ipfsHash: _dataHash,
			price: _price,
			id: itemUniqueHashId
		});

		// update our store variables
		itemIdsFromSeller[msg.sender].push(itemUniqueHashId);
		itemFromId[itemUniqueHashId] = item;
		arrOfItemIds.push(itemUniqueHashId);

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
			msg.value >= 0 && itemPrice <= msg.value,
			"Not sent enough money to buy the item"
		);

		// remove ids or items from our variables
		_removeFromAll(itemOwner, _itemId);

		// handle money transaction // not yet tsested because sale is not workingggg
		uint256 sellerProceeds = (itemPrice * 95) / 100;
		address payable sellerAddr = payable(itemOwner);
		(bool success, ) = sellerAddr.call{value: sellerProceeds}("");

		// TODO: cover this branch with a test
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
		require(foundItem.owner == msg.sender, "Only owner can delete their item!");

		// remove ids or items from our variables
		_removeFromAll(foundItem.owner, _itemId);

		emit eventDeleteItem(_itemId, foundItem.owner, arrOfItemIds.length);
	}

	//////////////////////////////////////////////////////
	//
	// _internalFunctions
	//
	//////////////////////////////////////////////////////

	// remove ids or items from our variables
	function _removeFromAll(address _owner, bytes32 _itemId) internal {
		_removeFromSeller(_owner, _itemId);
		_removeFromStock(_itemId);
		_removeFromItemIds(_itemId);
	}

	// delete struct from our itemsForSale mapping
	function _removeFromStock(bytes32 _itemId) internal {
		delete itemFromId[_itemId];

		emit eventItemRemovedFromStock(_itemId);
	}

	// helper for _removeFromItemIds
	function _getItemIndex(
		bytes32 _itemId,
		uint256 _length,
		bytes32[] memory itemIds
	) internal pure returns (uint256) {
		uint256 i = 0;
		for (i; i < _length; i++) {
			if (itemIds[i] == _itemId) {
				break; // saves the state of i for our return (skips increment)
			}
		}
		return i; //1 more than last index since that's what broke the loop
	}

	function _removeFromItemIds(bytes32 _itemId) internal {
		uint256 length = arrOfItemIds.length;
		uint256 index = _getItemIndex(_itemId, length, arrOfItemIds);

		// once found, shuffle our item list forward
		for (uint256 i = index; i < length - 1; i++) {
			arrOfItemIds[i] = arrOfItemIds[i + 1];
		}
		// remove the last item to reduce the length
		arrOfItemIds.pop();

		emit eventItemRemovedFromIdList(index, _itemId);
	}

	// helper for _removeFromSeller
	function _getSellerItemIndex(
		bytes32 _itemId,
		bytes32[] memory _ownerIds,
		uint256 _length
	) internal pure returns (uint256) {
		uint256 i = 0;
		for (i; i < _length; i++) {
			// TODO: cover this branch with a test
			if (_ownerIds[i] == _itemId) {
				break; // saves the state of i for our return
			}
		}
		return i; // 1 more than last index since that's what broke the loop
	}

	function _removeFromSeller(address _owner, bytes32 _itemId) internal {
		uint256 length = itemIdsFromSeller[_owner].length;
		uint256 index = _getSellerItemIndex(
			_itemId,
			itemIdsFromSeller[_owner],
			length
		);

		// reshuffle our seller's item list so we remove the item
		for (uint256 i = index; i < length - 1; i++) {
			itemIdsFromSeller[_owner][i] = itemIdsFromSeller[_owner][i + 1];
		}
		// remove the last item to reduce the length - maybe just replaces the value with default value??
		itemIdsFromSeller[_owner].pop();

		emit eventItemRemovedFromSeller(index, _itemId);
	}
}
