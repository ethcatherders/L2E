// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IReward.sol";

contract Reward is IReward, ERC721, Ownable, Pausable, ReentrancyGuard {
    uint256 private _supply;
    string private _metadataURI;
    mapping(address => bool) private _claimed;

    constructor(
        string memory name,
        string memory symbol,
        address owner,
        string memory baseURI
    ) ERC721(name, symbol) {
        _metadataURI = baseURI;
        transferOwnership(owner);
    }

    /**
     * @dev Mints token to recipient address (msg.sender) that has not claimed before
     *
     * note to address cannot be used more than once.
     * note to must have a balance less than 0.
     */
    function mint() external override whenNotPaused nonReentrant {
        require(!_claimed[msg.sender], "Reward: recipient already claimed");
        require(balanceOf(msg.sender) == 0, "Reward: recipient balance greater than 0");
        uint256 tokenId = _supply + 1;
        _claimed[msg.sender] = true;
		_supply++;
        _safeMint(msg.sender, tokenId);
    }

    /**
     * @dev Returns a boolean to indicate if account has been used to mint token
     *
     * @param account - address of claimer
     *
     * note Only owner can call this view function.
     */
    function claimed(address account)
        external
        view
        override
        returns (bool)
    {
        return _claimed[account];
    }

    /**
     * @dev Returns supply of tokens
     */
    function supply() external view override returns (uint256) {
        return _supply;
    }

	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return _baseURI();
    }

    function _baseURI() internal view override returns (string memory) {
        return _metadataURI;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
