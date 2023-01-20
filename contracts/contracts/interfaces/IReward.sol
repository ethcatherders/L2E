// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IReward {
  function init(string memory name, string memory symbol, string memory baseURI, address assignedOwner) external;

  function mint() external;

  function claimed(address account) external view returns (bool);

  function supply() external view returns (uint256);
}