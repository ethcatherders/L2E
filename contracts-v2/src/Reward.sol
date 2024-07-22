// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { IReward } from "./interfaces/IReward.sol";

contract Reward is 
    IReward,
    ERC721Enumerable,
    EIP712,
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

    string private constant SIGNING_DOMAIN = "L2E Reward";
    string private constant SIGNATURE_VERSION = "1";
    
    bytes32 private constant CLAIMABLE_TYPE_HASH = keccak256("Claimable(address to)");

    struct Claimable {
        address to;
    }

    constructor(address owner) 
        Ownable(owner) 
        ERC721("Learn2Earn Reward", "L2E") 
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

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
    function mint(bytes calldata signature) external override initialized whenNotPaused nonReentrant {
        _claimMint(msg.sender, signature);
    }

    /**
     * @dev Mints token to recipient address that has not claimed before
     *
     * note to address cannot be used more than once.
     * note to must have a balance less than 0.
     */
    function mint(address to, bytes calldata signature) external override initialized whenNotPaused nonReentrant {
        _claimMint(to, signature);
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
        _requireOwned(tokenId);
        return _baseURI();
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _baseURI() internal view override returns (string memory) {
        return _metadataURI;
    }

    function _claimMint(address to, bytes calldata signature) internal {
        require(!_claimed[to], "Reward: recipient already claimed");
        require(balanceOf(to) == 0, "Reward: recipient balance greater than 0");
        Claimable memory claimable = Claimable({to: to});
        bytes32 hash = _hashClaimableStruct(claimable);
        require(_isValidSignature(owner(), hash, signature), "Reward: invalid signature");
        uint256 tokenId = _supply + 1;
        _claimed[to] = true;
		_supply++;
        _safeMint(to, tokenId);
    }

    function _hashClaimableStruct(Claimable memory _claimable)
        internal
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                CLAIMABLE_TYPE_HASH,
                address(_claimable.to)
            )
        );
        return _hashTypedDataV4(structHash);
    }

    function _isValidSignature(
        address signer,
        bytes32 hash,
        bytes calldata signature
    ) internal view returns (bool) {
        return SignatureChecker.isValidSignatureNow(signer, hash, signature);
    }
}
