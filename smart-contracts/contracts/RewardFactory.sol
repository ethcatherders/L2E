// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Reward.sol";
import "./interfaces/IRewardFactory.sol";

contract RewardFactory is Ownable, IRewardFactory {
    event Create(address contractAddress, address indexed creator, address indexed assignedTo);

    function create(
        address assignedOwner,
        string memory baseURI
    ) public override onlyOwner returns (address) {
        address nftAddress = address(
            new Reward("Learn2Earn Reward", "L2E", assignedOwner, baseURI)
        );
        emit Create(nftAddress, msg.sender, assignedOwner);
        return nftAddress;
    }
}
