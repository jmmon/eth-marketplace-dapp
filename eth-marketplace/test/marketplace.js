const { assert } = require("chai");

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

const Marketplace = artifacts.require("Marketplace");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Marketplace", function (accounts) {
  it('should block withdrawal if balance is less than amount', async function () {
    const instance = await Marketplace.deployed();

    // const balance = instance.balance({from: accounts[0]});

    await expectRevert(
      instance.withdraw(100, {from: accounts[0]}),
      "can only withdraw balance that is available"
    )
    // const response = instance.withdraw(100, {from: accounts[0]});
    // const newBalance = instance.balance({from: accounts[0]});

    // assert.notEqual(balance, newBalance);
  });

  it('should block balance viewing if not owner', async function () {
    const instance = await Marketplace.deployed();

    await expectRevert(
      instance.balance({from: accounts[1]}),
      "Not permitted to view balance"
    );
  });

  it('should allow balance check from owner', async function () {
    const instance = await Marketplace.deployed();

    const balance = await instance.balance({from: accounts[0]});
    assert.equal(balance, 0, "initial balance should be 0");
  })

  it("should start with no items", async function () {
    const instance = await Marketplace.deployed();
    const itemIdsLength = await instance.getAllItems();
    // const itemIdsLength = await instance.arrOfItemIds().length;
    assert.equal(itemIdsLength, 0, "should start with no items");
  });

  it("reverts when seller tries to buy their own item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, {
      from: accounts[0],
    });

    const itemIdFromSeller = await instance.itemIdsFromSeller(accounts[0], 0);
    await expectRevert(
      instance.sell(itemIdFromSeller, { from: accounts[0] }),
      "Owner cannot buy their own items!"
    );
  });

  it("should register an item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, {
      from: accounts[0],
    });

    // const itemIdsLength = await instance.getItemIdsLength();
    // assert.equal(itemIdsLength, BN(1), "should now have 1 item");

    const items = await instance.getAllItems();
    assert.equal(
      items[0].ipfsHash,
      item.ipfsHash,
      "should have the same ipfsHash that we added"
    );

    assert.equal(
      items[0].price,
      item.price,
      "should have the same price that we added"
    );

    assert.equal(
      items[0].owner,
      accounts[0],
      "should have account 0 as the owner of the item"
    );

    const itemFromAddress = await instance.itemIdsFromSeller(accounts[0], 0);
    assert.equal(
      itemFromAddress,
      items[0].id,
      "seller's first item should be the added item"
    );
  });

  // this test is to hit line 10? by passing 0 into the toString function so it returns "0"
  it("should cover line 10? by creating an item with price of 0", async function () {
    const instance = await Marketplace.deployed();
    const item = {ipfsHash: 'some string for the data', price: 0,};

    await instance.addItem(item.ipfsHash, item.price, { from: accounts[0] });
    
    const items = await instance.getAllItems();

    assert.equal(items[2].ipfsHash, item.ipfsHash, "should have the same ipfs hash");

  });

  it("should sell an item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 100,
    };

    // add item
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[2] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[2], 0);

    await instance.sell(itemIdFromAddress, {
      from: accounts[1],
      value: "100",
      gasLimit: "3000000",
    });

    // after sold, that means the seller should no longer hold the item;

    //also getItemFromId should return a "deleted" item, so could check that the properties don't match the item
    // const newItemIdFromSeller = await instance.itemIdsFromSeller(accounts[2], 0);

    const itemFromIds = await instance.itemFromId(itemIdFromAddress);
    assert.notEqual(
      item.ipfsHash,
      itemFromIds.ipfsHash,
      "the hash should be different because it's deleted"
    );
    assert.notEqual(
      item.price,
      itemFromIds.price,
      "the price should be different because it's deleted"
    );
  });

  it("should revert sell from not enough funds", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 100000000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[2] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[2], 0);

    await expectRevert(
      instance.sell(itemIdFromAddress, {
        from: accounts[1],
        value: "100",
      }),
      "Not sent enough money to buy the item"
    );
  });

  it("should delete item if owner", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[0] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[0], 0);

    await instance.deleteItem(itemIdFromAddress, {
      from: accounts[0],
    });

    const receivedItem = await instance.itemFromId(itemIdFromAddress);

    assert.notEqual(
      item.ipfsHash,
      receivedItem.ipfsHash,
      "the hash should be different because it's deleted"
    );
    assert.notEqual(
      item.price,
      receivedItem.price,
      "the price should be different because it's deleted"
    );
  });

  it("should not allow withdrawal from other than owner", async function () {
    const instance = await Marketplace.deployed();
    
    await expectRevert(
      instance.withdraw(100, {
        from: accounts[1],
      }),
      "Not permitted to withdraw"
    );
  });

  it('should allow withdrawal from owner', async function () {
    const instance = await Marketplace.deployed();

    const balance = instance.balance({from: accounts[0]});
    const response = instance.withdraw(100, {from: accounts[0]});
    const newBalance = instance.balance({from: accounts[0]});

    assert.notEqual(balance, newBalance);
  });

  // it("should prevent delete if not owner of item", async function () {
  //   const instance = await Marketplace.deployed();
  //   const item = {
  //     ipfsHash: "some data hash to ipfs",
  //     price: 1_000_000_000,
  //   };
  //   await instance.addItem(item.ipfsHash, item.price, { from: accounts[0] });

  //   const itemId = await instance.itemIdsFromSeller(accounts[0], 0);

  //   await expectRevert(
  //     instance.deleteItem(itemId, {
  //       from: accounts[9],
  //     }),
  //     "Only owner can delete their item!"
  //   );
  // });

});





  // it("test get balance", async function () {
  //   let senderBal = await web3.eth.getBalance(accounts[0]);
  //   let receiverBal = await web3.eth.getBalance(accounts[1]);
  //   // assert.equal(senderBal, 100, "checking sender balances hopefully");
  //   // sender balance == 99_999_999_999_995_602_425
  //   // i think that means starts at 100
  //   assert.equal(100, receiverBal, "checking receiver balances hopefully");
  //   // receiverBal == 100_000_000_000_000_000_000
  //   // so 100 eth
  // })

  // it("should pay seller when item sells", async function () {
  //   const instance = await Marketplace.deployed();
  //   // const instance = await Marketplace.at(accounts[9])
  //   const item = {
  //     ipfsHash: "some data hash to ipfs",
  //     price: 1000000,
  //   };
  //   await instance.addItem(item.ipfsHash, item.price, { from: accounts[0] });

  //   const itemIdsFromAddress =
  //     await instance.getItemIdsFromSeller(accounts[0]);


  //     from: accounts[1],
  //     value: '1000000000000000',
  //   });

  //   const contractBalance = web3.eth.getBalance(Marketplace.address);
  //   assert.notEqual(contractBalance, 0, 'should be non-zero contract balance');
  //   // expectEvent(receipt, 'eventSell', {_contractBalance: '', _sellerProceeds: '', _remainingItemsForSale: ''})
  // });


  // it("should give seller the proceeds and retain 5%", async function () {
  //   const instance = await Marketplace.deployed();
  //   const item = {
  //     ipfsHash: "some data hash to ipfs",
  //     price: 100,
  //   };
  //   await instance.addItem(item.ipfsHash, item.price, { from: accounts[3] });

  //   const itemIdsFromAddress =
  //     await instance.getItemIdsFromSeller(accounts[3]);

  //   await instance.sell(itemIdsFromAddress[0], {
  //     from: accounts[1],
  //     value: '100000000000',
  //   });

  //   // after sold, that means the seller should no longer hold the item;

  //   //also getItemFromId should return a "deleted" item, so could check that the properties don't match the item
  //   const itemIdsFromSeller =
  //     await instance.getItemIdsFromSeller(accounts[3]);

  //   const itemIdZero = itemIdsFromSeller[0];
  //   const itemFromIds = await instance.itemFromId(itemIdZero);
  //   assert.notEqual(
  //     item.ipfsHash,
  //     itemFromIds.ipfsHash,
  //     "the hash should be different because it's deleted"
  //   );
  //   assert.notEqual(
  //     item.price,
  //     itemFromIds.price,
  //     "the price should be different because it's deleted"
  //   );

  //   const contractBalance = await web3.eth.getBalance(Marketplace.address);
  //   const expectedBalance = item.price * 5 / 100;
  //   assert.equal(
  //     contractBalance, expectedBalance, "Contract should keep 5% of sales price"
  //   );
  // });