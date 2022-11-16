// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IReward.sol";

contract Reward is 
    IReward,
    ERC721Enumerable,
    Ownable,
    Pausable,
    Initializable,
    ReentrancyGuard
{
    string private _name;
    string private _symbol;
    uint256 private _supply;
    string private _metadataURI;
    mapping(address => bool) private _claimed;
    bool private _initialized = false;

    constructor(address owner) ERC721("Learn2Earn Reward", "L2E") {
        transferOwnership(owner);
    }

    modifier initialized() {
        require(_initialized, "Reward: contract not initialized");
        _;
    }

    // solhint-disable-next-line no-empty-blocks
    function initLock() external initializer {}

    function init(
        string memory name_,
        string memory symbol_,
        string memory baseURI,
        address assignedOwner
    ) external override initializer {
        require(bytes(baseURI).length > 0, "Reward: no baseURI");
        require(bytes(name_).length > 0, "Reward: no name");
        require(bytes(symbol_).length > 0, "Reward: no symbol");
        require(assignedOwner != address(0), "Reward: no assignedOwner");
        _name = name_;
        _symbol = symbol_;
        _metadataURI = baseURI;
        _transferOwnership(assignedOwner);
        _initialized = true;
    }

    /**
     * @dev Mints token to recipient address (msg.sender) that has not claimed before
     *
     * note to address cannot be used more than once.
     * note to must have a balance less than 0.
     */
    function mint() external override initialized whenNotPaused nonReentrant {
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

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
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
