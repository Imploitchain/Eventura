// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketMarketplace
 * @dev Secondary marketplace for ticket resales
 * TODO: Implement marketplace functionality for ticket resales
 */
contract TicketMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint128 price;
        bool active;
    }

    struct Offer {
        address offerer;
        uint128 amount;
    }

    // nft => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    // nft => tokenId => best Offer (escrowed)
    mapping(address => mapping(uint256 => Offer)) public bestOffers;
    // user => proceeds balance (ETH)
    mapping(address => uint256) public proceeds;

    address public feeRecipient;
    uint16 public feeBps; // fee in basis points (1% = 100)

    event Listed(address indexed nft, uint256 indexed tokenId, address indexed seller, uint128 price);
    event ListingCanceled(address indexed nft, uint256 indexed tokenId, address indexed seller);
    event Purchased(address indexed nft, uint256 indexed tokenId, address indexed buyer, uint128 price, uint256 fee);
    event OfferMade(address indexed nft, uint256 indexed tokenId, address indexed offerer, uint128 amount);
    event OfferCanceled(address indexed nft, uint256 indexed tokenId, address indexed offerer, uint128 amount);
    event OfferAccepted(address indexed nft, uint256 indexed tokenId, address seller, address buyer, uint128 amount, uint256 fee);
    event FeeUpdated(uint16 feeBps);
    event FeeRecipientUpdated(address feeRecipient);
    event ProceedsWithdrawn(address indexed user, uint256 amount);

    constructor(address _feeRecipient, uint16 _feeBps) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "invalid fee recipient");
        require(_feeBps <= 2000, "fee too high");
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
    }

    function setFeeBps(uint16 _feeBps) external onlyOwner {
        require(_feeBps <= 2000, "fee too high");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "invalid fee recipient");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    function listTicket(address nft, uint256 tokenId, uint128 price) external nonReentrant {
        require(price > 0, "price=0");
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "not owner");
        require(
            token.getApproved(tokenId) == address(this) || token.isApprovedForAll(msg.sender, address(this)),
            "not approved"
        );

        listings[nft][tokenId] = Listing({seller: msg.sender, price: price, active: true});
        emit Listed(nft, tokenId, msg.sender, price);
    }

    function cancelListing(address nft, uint256 tokenId) external nonReentrant {
        Listing storage l = listings[nft][tokenId];
        require(l.active, "no listing");
        require(l.seller == msg.sender, "not seller");
        delete listings[nft][tokenId];
        emit ListingCanceled(nft, tokenId, msg.sender);
    }

    function buyTicket(address nft, uint256 tokenId) external payable nonReentrant {
        Listing storage l = listings[nft][tokenId];
        require(l.active, "no listing");
        require(msg.value == uint256(l.price), "bad value");

        address seller = l.seller;
        require(seller != address(0), "bad listing");

        delete listings[nft][tokenId];

        uint256 fee = (msg.value * feeBps) / 10000;
        uint256 sellerAmount = msg.value - fee;
        proceeds[feeRecipient] += fee;
        proceeds[seller] += sellerAmount;

        IERC721(nft).safeTransferFrom(seller, msg.sender, tokenId);
        emit Purchased(nft, tokenId, msg.sender, l.price, fee);
    }

    function makeOffer(address nft, uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "no value");
        Offer storage current = bestOffers[nft][tokenId];
        if (current.amount > 0) {
            require(msg.value > current.amount, "low offer");
            _refund(current.offerer, current.amount);
        }
        bestOffers[nft][tokenId] = Offer({offerer: msg.sender, amount: uint128(msg.value)});
        emit OfferMade(nft, tokenId, msg.sender, uint128(msg.value));
    }

    function cancelOffer(address nft, uint256 tokenId) external nonReentrant {
        Offer storage current = bestOffers[nft][tokenId];
        require(current.offerer == msg.sender, "not offerer");
        uint128 amount = current.amount;
        delete bestOffers[nft][tokenId];
        _refund(msg.sender, amount);
        emit OfferCanceled(nft, tokenId, msg.sender, amount);
    }

    function acceptOffer(address nft, uint256 tokenId) external nonReentrant {
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == msg.sender, "not owner");
        require(
            token.getApproved(tokenId) == address(this) || token.isApprovedForAll(msg.sender, address(this)),
            "not approved"
        );

        Offer storage current = bestOffers[nft][tokenId];
        require(current.amount > 0, "no offer");
        address buyer = current.offerer;
        uint256 amount = current.amount;
        delete bestOffers[nft][tokenId];
        delete listings[nft][tokenId];

        uint256 fee = (amount * feeBps) / 10000;
        uint256 sellerAmount = amount - fee;
        proceeds[feeRecipient] += fee;
        proceeds[msg.sender] += sellerAmount;

        token.safeTransferFrom(msg.sender, buyer, tokenId);
        emit OfferAccepted(nft, tokenId, msg.sender, buyer, uint128(amount), fee);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "no proceeds");
        proceeds[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "withdraw failed");
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    function _refund(address to, uint128 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "refund failed");
    }
}
