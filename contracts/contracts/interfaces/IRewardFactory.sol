// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IRewardFactory {
    function create(string memory name, string memory symbol, address assignedOwner, string memory baseURI) external returns (address);
}