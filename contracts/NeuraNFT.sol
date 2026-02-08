// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NeuraNFT
 * @dev ERC-721 NFT contract with royalties support for Neura Testnet
 * @notice This contract allows users to mint, list, and sell NFTs with configurable royalties
 */
contract NeuraNFT is ERC721, ERC721URIStorage, ERC721Enumerable, IERC2981, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // NFT Metadata structure
    struct NFTMetadata {
        string name;
        string description;
        string imageURI;
        string mediaType;
        uint256 royaltyPercentage;
        address creator;
        uint256 createdAt;
    }
    
    // Listing structure for marketplace
    struct Listing {
        uint256 price;
        address seller;
        bool isActive;
        uint256 listedAt;
    }
    
    // Combined NFT info structure for view functions
    struct NFTFullInfo {
        uint256 tokenId;
        string name;
        string description;
        string imageURI;
        string mediaType;
        uint256 royaltyPercentage;
        address creator;
        uint256 createdAt;
        address currentOwner;
        uint256 price;
        bool isListed;
    }
    
    // Mappings
    mapping(uint256 => NFTMetadata) public tokenMetadata;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public creatorTokens;
    mapping(address => uint256[]) public ownerTokens;
    
    // Platform configuration
    uint256 public platformFee = 250; // 2.5% in basis points
    address public platformWallet;
    uint256 public constant MAX_ROYALTY = 2000; // 20% max royalty
    uint256 public constant MAX_BATCH_SIZE = 50;
    
    // Events
    event NFTCreated(
        uint256 indexed tokenId, 
        address indexed creator, 
        string name,
        string imageURI,
        uint256 royaltyPercentage
    );
    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTUnlisted(uint256 indexed tokenId, address indexed seller);
    event NFTSold(
        uint256 indexed tokenId, 
        address indexed seller, 
        address indexed buyer, 
        uint256 price,
        uint256 platformFeeAmount,
        uint256 royaltyAmount
    );
    event BatchMinted(address indexed creator, uint256[] tokenIds);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformWalletUpdated(address oldWallet, address newWallet);
    
    constructor() ERC721("Neura NFT Creator Studio", "NNFT") {
        platformWallet = msg.sender;
    }
    
    /**
     * @dev Mint a single NFT
     */
    function mintNFT(
        string memory name,
        string memory description,
        string memory imageURI,
        string memory mediaType,
        uint256 royaltyPercentage,
        string memory tokenURI_
    ) external returns (uint256) {
        require(royaltyPercentage <= MAX_ROYALTY, "Royalty exceeds maximum");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(imageURI).length > 0, "Image URI cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);
        
        tokenMetadata[newTokenId] = NFTMetadata({
            name: name,
            description: description,
            imageURI: imageURI,
            mediaType: mediaType,
            royaltyPercentage: royaltyPercentage,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        creatorTokens[msg.sender].push(newTokenId);
        
        emit NFTCreated(newTokenId, msg.sender, name, imageURI, royaltyPercentage);
        return newTokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs
     */
    function batchMint(
        string[] memory names,
        string[] memory descriptions,
        string[] memory imageURIs,
        string[] memory mediaTypes,
        uint256[] memory royaltyPercentages,
        string[] memory tokenURIs
    ) external returns (uint256[] memory) {
        require(names.length == descriptions.length, "Array length mismatch");
        require(names.length == imageURIs.length, "Array length mismatch");
        require(names.length == mediaTypes.length, "Array length mismatch");
        require(names.length == royaltyPercentages.length, "Array length mismatch");
        require(names.length == tokenURIs.length, "Array length mismatch");
        require(names.length <= MAX_BATCH_SIZE, "Exceeds max batch size");
        require(names.length > 0, "Empty batch");
        
        uint256[] memory tokenIds = new uint256[](names.length);
        
        for (uint256 i = 0; i < names.length; i++) {
            require(royaltyPercentages[i] <= MAX_ROYALTY, "Royalty exceeds maximum");
            
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            
            _safeMint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i]);
            
            tokenMetadata[newTokenId] = NFTMetadata({
                name: names[i],
                description: descriptions[i],
                imageURI: imageURIs[i],
                mediaType: mediaTypes[i],
                royaltyPercentage: royaltyPercentages[i],
                creator: msg.sender,
                createdAt: block.timestamp
            });
            
            creatorTokens[msg.sender].push(newTokenId);
            tokenIds[i] = newTokenId;
            
            emit NFTCreated(newTokenId, msg.sender, names[i], imageURIs[i], royaltyPercentages[i]);
        }
        
        emit BatchMinted(msg.sender, tokenIds);
        return tokenIds;
    }
    
    /**
     * @dev List an NFT for sale
     */
    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isActive, "Already listed");
        
        approve(address(this), tokenId);
        
        listings[tokenId] = Listing({
            price: price,
            seller: msg.sender,
            isActive: true,
            listedAt: block.timestamp
        });
        
        emit NFTListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Remove NFT from sale
     */
    function unlistFromSale(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].isActive, "Not listed");
        
        listings[tokenId].isActive = false;
        
        emit NFTUnlisted(tokenId, msg.sender);
    }
    
    /**
     * @dev Buy a listed NFT
     */
    function buyNFT(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "NFT not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own NFT");
        
        NFTMetadata memory metadata = tokenMetadata[tokenId];
        
        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        
        if (metadata.creator != listing.seller) {
            royaltyAmount = (listing.price * metadata.royaltyPercentage) / 10000;
        }
        
        uint256 sellerAmount = listing.price - platformFeeAmount - royaltyAmount;
        
        listings[tokenId].isActive = false;
        
        _transfer(listing.seller, msg.sender, tokenId);
        
        if (platformFeeAmount > 0) {
            payable(platformWallet).transfer(platformFeeAmount);
        }
        if (royaltyAmount > 0) {
            payable(metadata.creator).transfer(royaltyAmount);
        }
        payable(listing.seller).transfer(sellerAmount);
        
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit NFTSold(tokenId, listing.seller, msg.sender, listing.price, platformFeeAmount, royaltyAmount);
    }
    
    /**
     * @dev Update listing price
     */
    function updateListingPrice(uint256 tokenId, uint256 newPrice) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].isActive, "Not listed");
        require(newPrice > 0, "Price must be greater than 0");
        
        listings[tokenId].price = newPrice;
        
        emit NFTListed(tokenId, msg.sender, newPrice);
    }
    
    // ============ View Functions (Refactored to avoid stack too deep) ============
    
    /**
     * @dev Get NFT full info - returns a struct to avoid stack too deep
     */
    function getNFTFullInfo(uint256 tokenId) external view returns (NFTFullInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        
        NFTMetadata storage metadata = tokenMetadata[tokenId];
        Listing storage listing = listings[tokenId];
        
        return NFTFullInfo({
            tokenId: tokenId,
            name: metadata.name,
            description: metadata.description,
            imageURI: metadata.imageURI,
            mediaType: metadata.mediaType,
            royaltyPercentage: metadata.royaltyPercentage,
            creator: metadata.creator,
            createdAt: metadata.createdAt,
            currentOwner: ownerOf(tokenId),
            price: listing.price,
            isListed: listing.isActive
        });
    }
    
    /**
     * @dev Get basic NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId];
    }
    
    /**
     * @dev Get NFT listing info
     */
    function getNFTListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
    
    /**
     * @dev Get NFT owner
     */
    function getNFTOwner(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return ownerOf(tokenId);
    }
    
    function getCreatorTokens(address creator) external view returns (uint256[] memory) {
        return creatorTokens[creator];
    }
    
    function getListedNFTs() external view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIds.current();
        uint256 listedCount = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isActive) {
                listedCount++;
            }
        }
        
        uint256[] memory listedTokens = new uint256[](listedCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (listings[i].isActive) {
                listedTokens[index] = i;
                index++;
            }
        }
        
        return listedTokens;
    }
    
    /**
     * @dev Get multiple NFTs info at once
     */
    function getNFTsBatch(uint256[] calldata tokenIds) external view returns (NFTFullInfo[] memory) {
        NFTFullInfo[] memory infos = new NFTFullInfo[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_exists(tokenIds[i])) {
                NFTMetadata storage metadata = tokenMetadata[tokenIds[i]];
                Listing storage listing = listings[tokenIds[i]];
                
                infos[i] = NFTFullInfo({
                    tokenId: tokenIds[i],
                    name: metadata.name,
                    description: metadata.description,
                    imageURI: metadata.imageURI,
                    mediaType: metadata.mediaType,
                    royaltyPercentage: metadata.royaltyPercentage,
                    creator: metadata.creator,
                    createdAt: metadata.createdAt,
                    currentOwner: ownerOf(tokenIds[i]),
                    price: listing.price,
                    isListed: listing.isActive
                });
            }
        }
        
        return infos;
    }
    
    function getTotalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    // ERC2981 Royalty Standard
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        override 
        returns (address receiver, uint256 royaltyAmount) 
    {
        NFTMetadata storage metadata = tokenMetadata[tokenId];
        uint256 amount = (salePrice * metadata.royaltyPercentage) / 10000;
        return (metadata.creator, amount);
    }
    
    // Admin functions
    
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        address oldWallet = platformWallet;
        platformWallet = newWallet;
        emit PlatformWalletUpdated(oldWallet, newWallet);
    }
    
    // Required overrides
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
    
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds.current() && _ownerOf(tokenId) != address(0);
    }
}
