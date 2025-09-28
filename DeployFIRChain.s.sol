// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {FIRChain} from "../src/FIRChain.sol";

contract DeployFIR is Script {
    function run() external {
        vm.startBroadcast();
        FIRChain fir = new FIRChain();
        vm.stopBroadcast();
    }
}
