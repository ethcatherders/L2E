// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { IReward } from "./interfaces/IReward.sol";
import { IRewardFactory } from "./interfaces/IRewardFactory.sol";

contract RewardFactory is Ownable, IRewardFactory {
    address public implementation;
    uint256 public count;
    mapping(uint256 => address) public rewards;

    event CreateReward(uint256 indexed index, address contractAddress, address assignedOwner, address creator);
    event UpdateImplementation(address previousImplementation, address newImplementation);

    constructor(address newImplementation) Ownable(msg.sender) {
        implementation = newImplementation;
    }

    function create(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address assignedOwner
    ) 
        public 
        override 
        onlyOwner 
        returns (address) 
    {
        require(bytes(name).length > 0, "RewardFactory: no name length");
        require(bytes(symbol).length > 0, "RewardFactory: no symbol length");
        require(bytes(baseURI).length > 0, "RewardFactory: no baseURI length");
        address newAddress = Clones.clone(implementation);
        IReward(newAddress).init(name, symbol, baseURI, assignedOwner);
        uint256 index = count;
        rewards[count] = newAddress;
        count = index + 1;
        emit CreateReward(index, newAddress, assignedOwner, msg.sender);
        return newAddress;
    }

    function setImplementation(address newImplementation)
        external 
        onlyOwner 
    {
        require(
            newImplementation != address(0) && newImplementation != implementation,
            "RewardFactory: invalid implementation address"
        );
        address oldImplementation = implementation;
        implementation = newImplementation;
        emit UpdateImplementation(oldImplementation, newImplementation);
    }
}
