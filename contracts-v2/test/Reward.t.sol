// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {Reward} from "../src/Reward.sol";
import {BaseReward} from "./utils/BaseReward.sol";

contract RewardTest is Test {
    BaseReward internal reward;
    
    uint256 internal ownerPrivateKey = 11111111;
    address internal owner;

    function setUp() public {
        owner = vm.addr(ownerPrivateKey);
        reward = new BaseReward(owner);
    }

    function test_init() public {
        reward.init(
            "Learn2Earn Reward", 
            "L2E", 
            "https://example.com/", 
            owner
        );
        assertEq(reward.name(), "Learn2Earn Reward");
        assertEq(reward.symbol(), "L2E");
        assertEq(reward.owner(), owner);
    }

    function test_mint() public {
        reward.init(
            "Learn2Earn Reward", 
            "L2E", 
            "https://example.com/", 
            owner
        );

        // Mint to specified address
        address to = vm.addr(2);
        vm.prank(owner);
        bytes memory signature = _signClaimable(reward, to, ownerPrivateKey);
        reward.mint(to, signature);

        assertEq(reward.balanceOf(to), 1);
        assertEq(reward.ownerOf(1), to);

        // Mint to msg.sender
        address sender = vm.addr(3);
        vm.prank(owner);
        signature = _signClaimable(reward, sender, ownerPrivateKey);
        vm.prank(sender);
        reward.mint(signature);

        assertEq(reward.balanceOf(sender), 1);
        assertEq(reward.ownerOf(2), sender);
    }

    function _signClaimable(BaseReward _reward, address to, uint256 privateKey) internal returns (bytes memory) {
        Reward.Claimable memory claim = Reward.Claimable({
            to: to
        });
        bytes32 hash = _reward.hashClaimableStruct(claim);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        return abi.encodePacked(r, s, v);
    }
}
