const Marketplace = artifacts.require("Marketplace");



/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Marketplace", function ( accounts ) {
  // first test passing!!! WOOOOOOT!
  it("should start with no items", async function () {
    const instance = await Marketplace.deployed();
    const itemIdsLength = await instance.getItemIdsCount();

    assert.equal(itemIdsLength, 0, "should start with no items");
  });

  // it("should register an item", async function () {
  //   const instance = await Marketplace.deployed();
  //   const response = await instance.addItem("the data hash", 12345, {from: accounts[0]});
    
  //   assert(Object.isObject(response), "should return true");
  // });

});
