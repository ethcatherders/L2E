// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Reward} from "../../src/Reward.sol";

contract BaseReward is Reward {
    constructor(address owner) Reward(owner) {}

    function hashClaimableStruct(Claimable memory _claimable)
        public
        view
        returns (bytes32)
    {
        return super._hashClaimableStruct(_claimable);
    }

    function isValidSignature(
        address signer,
        bytes32 hash,
        bytes calldata signature
    ) public view returns (bool) {
        return super._isValidSignature(signer, hash, signature);
    }
}