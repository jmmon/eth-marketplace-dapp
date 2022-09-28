
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// These files are dynamically created at test time
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestMarketplace {

	// function testSomething() public {
	// 	Marketplace market = Marketplace(DeployedAddresses.Marketplace()); // looks up deploy address and casts it to the contract

	// 	// do something
	// }

	// function testSomethingElse() public {
	// 	Marketplace market = new Marketplace();
	// 	// do something
	// }

  // function testInitialBalanceUsingDeployedContract() public {
  //   MetaCoin meta = MetaCoin(DeployedAddresses.MetaCoin());

  //   uint expected = 10000;

  //   Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  // }

  // function testInitialBalanceWithNewMetaCoin() public {
  //   MetaCoin meta = new MetaCoin();

  //   uint expected = 10000;

  //   Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  // }

}
