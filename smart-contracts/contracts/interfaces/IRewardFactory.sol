// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IRewardFactory {
    function create(address assignedOwner, string memory baseURI) external returns (address);
}