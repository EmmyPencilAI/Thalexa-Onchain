// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Thalexa} from "../src/Thalexa.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract ThalexaTest is Test {
    Thalexa public thalexa;
    MockUSDC public usdc;
    address farmer = address(0x1);
    address retailer = address(0x2);

    function setUp() public {
        usdc = new MockUSDC();
        thalexa = new Thalexa(address(usdc));

        usdc.mint(farmer, 1000 * 1e6);
        vm.prank(farmer);
        usdc.approve(address(thalexa), type(uint256).max);
    }

    function test_InitializeAndMint() public {
        vm.prank(farmer);
        uint256 batchId = thalexa.initializeBatch("COF-001", "Colombia", 1710000000);

        vm.prank(farmer);
        thalexa.updateStatus(batchId, Thalexa.Status.ReadyForSale);

        vm.prank(farmer);
        uint256 tokenId = thalexa.mintNFT(batchId, "ipfs://QmTest");

        assertEq(thalexa.ownerOf(tokenId), farmer);
    }
}