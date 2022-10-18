// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IReward {
  function mint(address to) external;

  function claimed(address account) external view returns (bool);

  function supply() external view returns (uint256);
}