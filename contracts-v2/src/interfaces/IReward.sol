// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReward {
  function init(string memory name, string memory symbol, string memory baseURI, address assignedOwner) external;

  function mint(bytes calldata signature) external;

  function mint(address to, bytes calldata signature) external;

  function claimed(address account) external view returns (bool);

  function supply() external view returns (uint256);
}