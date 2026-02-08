// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NeuraMarketplace
 * @dev Marketplace contract for trading NFTs on Neura Testnet
 * @notice Supports both native ANKR and WANKR token payments
 */
contract NeuraMarketplace is ReentrancyGuard, Ownable {
    
    // WANKR Token address on Neura Testnet
    IERC20 public immutable wankrToken;
    
    // Listing structure
    struct Listing {
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isWANKR; // true = WANKR, false = native ANKR
        bool isActive;
        uint256 listedAt;
    }
    
    // Offer structure
    struct Offer {
        address buyer;
        uint256 amount;
        bool isWANKR;
        uint256 expiresAt;
        bool isActive;
    }
    
    // State variables
    uint256 public listingCounter;
    uint256 public platformFee = 250; // 2.5%
    address public platformWallet;
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(address => mapping(uint256 => uint256)) public nftToListingId;
    mapping(uint256 => Offer[]) public listingOffers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userPurchases;
    
    // Events
    event Listed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        bool isWANKR
    );
    event Unlisted(uint256 indexed listingId, address indexed seller);
    event Sold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 platformFeeAmount,
        uint256 royaltyAmount
    );
    event PriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);
    event OfferMade(uint256 indexed listingId, address indexed buyer, uint256 amount, bool isWANKR);
    event OfferAccepted(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event OfferCancelled(uint256 indexed listingId, address indexed buyer);
    
    constructor(address _wankrToken) {
        wankrToken = IERC20(_wankrToken);
        platformWallet = msg.sender;
    }
    
    /**
     * @dev List an NFT for sale
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Price in wei (ANKR or WANKR)
     * @param isWANKR Whether price is in WANKR tokens
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool isWANKR
    ) external nonReentrant {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || 
                nft.getApproved(tokenId) == address(this), "Not approved");
        require(price > 0, "Price must be > 0");
        require(nftToListingId[nftContract][tokenId] == 0 || 
                !listings[nftToListingId[nftContract][tokenId]].isActive, "Already listed");
        
        listingCounter++;
        uint256 listingId = listingCounter;
        
        listings[listingId] = Listing({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isWANKR: isWANKR,
            isActive: true,
            listedAt: block.timestamp
        });
        
        nftToListingId[nftContract][tokenId] = listingId;
        userListings[msg.sender].push(listingId);
        
        emit Listed(listingId, nftContract, tokenId, msg.sender, price, isWANKR);
    }
    
    /**
     * @dev Remove NFT from sale
     * @param listingId Listing ID to remove
     */
    function unlistNFT(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Not active");
        
        listing.isActive = false;
        
        emit Unlisted(listingId, msg.sender);
    }
    
    /**
     * @dev Buy a listed NFT with native ANKR
     * @param listingId Listing ID to purchase
     */
    function buyWithANKR(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Not for sale");
        require(!listing.isWANKR, "Listed for WANKR");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own NFT");
        
        _executeSale(listingId, msg.sender, listing.price, false);
        
        // Refund excess
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
    }
    
    /**
     * @dev Buy a listed NFT with WANKR tokens
     * @param listingId Listing ID to purchase
     */
    function buyWithWANKR(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Not for sale");
        require(listing.isWANKR, "Listed for ANKR");
        require(msg.sender != listing.seller, "Cannot buy own NFT");
        require(wankrToken.balanceOf(msg.sender) >= listing.price, "Insufficient WANKR");
        require(wankrToken.allowance(msg.sender, address(this)) >= listing.price, "WANKR not approved");
        
        _executeSale(listingId, msg.sender, listing.price, true);
    }
    
    /**
     * @dev Internal function to execute sale
     */
    function _executeSale(
        uint256 listingId,
        address buyer,
        uint256 price,
        bool isWANKR
    ) internal {
        Listing storage listing = listings[listingId];
        
        // Calculate fees
        uint256 platformFeeAmount = (price * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        
        // Check for ERC2981 royalty info
        try IERC2981(listing.nftContract).royaltyInfo(listing.tokenId, price) 
            returns (address receiver, uint256 amount) {
            if (receiver != address(0) && receiver != listing.seller) {
                royaltyReceiver = receiver;
                royaltyAmount = amount;
            }
        } catch {}
        
        uint256 sellerAmount = price - platformFeeAmount - royaltyAmount;
        
        // Mark as sold before transfers
        listing.isActive = false;
        
        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(listing.seller, buyer, listing.tokenId);
        
        // Transfer payments
        if (isWANKR) {
            wankrToken.transferFrom(buyer, platformWallet, platformFeeAmount);
            if (royaltyAmount > 0) {
                wankrToken.transferFrom(buyer, royaltyReceiver, royaltyAmount);
            }
            wankrToken.transferFrom(buyer, listing.seller, sellerAmount);
        } else {
            payable(platformWallet).transfer(platformFeeAmount);
            if (royaltyAmount > 0) {
                payable(royaltyReceiver).transfer(royaltyAmount);
            }
            payable(listing.seller).transfer(sellerAmount);
        }
        
        userPurchases[buyer].push(listingId);
        
        emit Sold(listingId, buyer, price, platformFeeAmount, royaltyAmount);
    }
    
    /**
     * @dev Update listing price
     * @param listingId Listing ID
     * @param newPrice New price
     */
    function updatePrice(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Not active");
        require(newPrice > 0, "Price must be > 0");
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(listingId, oldPrice, newPrice);
    }
    
    /**
     * @dev Make an offer on a listing
     * @param listingId Listing ID
     * @param amount Offer amount
     * @param isWANKR Whether offer is in WANKR
     * @param duration Offer duration in seconds
     */
    function makeOffer(
        uint256 listingId,
        uint256 amount,
        bool isWANKR,
        uint256 duration
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Not for sale");
        require(amount > 0, "Amount must be > 0");
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");
        
        if (!isWANKR) {
            require(msg.value >= amount, "Insufficient ANKR sent");
        } else {
            require(wankrToken.balanceOf(msg.sender) >= amount, "Insufficient WANKR");
        }
        
        listingOffers[listingId].push(Offer({
            buyer: msg.sender,
            amount: amount,
            isWANKR: isWANKR,
            expiresAt: block.timestamp + duration,
            isActive: true
        }));
        
        emit OfferMade(listingId, msg.sender, amount, isWANKR);
    }
    
    /**
     * @dev Accept an offer
     * @param listingId Listing ID
     * @param offerIndex Index of the offer to accept
     */
    function acceptOffer(uint256 listingId, uint256 offerIndex) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Not active");
        
        Offer storage offer = listingOffers[listingId][offerIndex];
        require(offer.isActive, "Offer not active");
        require(offer.expiresAt > block.timestamp, "Offer expired");
        
        offer.isActive = false;
        
        _executeSale(listingId, offer.buyer, offer.amount, offer.isWANKR);
        
        emit OfferAccepted(listingId, offer.buyer, offer.amount);
    }
    
    // View functions
    
    function getActiveListings(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Listing[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].isActive) count++;
        }
        
        if (offset >= count) return new Listing[](0);
        
        uint256 resultSize = (offset + limit > count) ? count - offset : limit;
        Listing[] memory result = new Listing[](resultSize);
        
        uint256 index = 0;
        uint256 found = 0;
        for (uint256 i = 1; i <= listingCounter && index < resultSize; i++) {
            if (listings[i].isActive) {
                if (found >= offset) {
                    result[index] = listings[i];
                    index++;
                }
                found++;
            }
        }
        
        return result;
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    function getListingOffers(uint256 listingId) external view returns (Offer[] memory) {
        return listingOffers[listingId];
    }
    
    // Admin functions
    
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Max 10%");
        platformFee = newFee;
    }
    
    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
    }
    
    // Emergency functions
    
    function emergencyWithdrawANKR() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyWithdrawWANKR() external onlyOwner {
        uint256 balance = wankrToken.balanceOf(address(this));
        wankrToken.transfer(owner(), balance);
    }
}
