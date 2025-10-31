// script/Thalexa.s.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {Thalexa} from "../src/Thalexa.sol";

contract ThalexaScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        // Arc Testnet USDC (use mock or real if available)
        address usdc = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

        vm.startBroadcast(deployerKey);
        Thalexa thalexa = new Thalexa(usdc);
        vm.stopBroadcast();
    }
}