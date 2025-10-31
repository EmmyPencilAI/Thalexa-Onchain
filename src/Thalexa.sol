// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// These paths are correct after `forge install openzeppelin`
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Thalexa is ERC721URIStorage, Ownable {
    IERC20 public immutable usdc;
    uint256 public batchCounter;

    enum Status { Harvested, Roasted, Shipped, Delivered, ReadyForSale }

    struct CoffeeBatch {
        address owner;
        string batchId;
        string origin;
        int64 harvestDate;
        Status status;
        bool nftMinted;
        bool paymentReleased;
        string nftMetadataUri;
    }

    struct Event {
        string eventType;
        string details;
        uint256 timestamp;
        address recordedBy;
    }

    mapping(uint256 => CoffeeBatch) public batches;
    mapping(uint256 => Event[]) public batchEvents;

    event BatchCreated(uint256 indexed batchId, string batchIdStr, address farmer);
    event EventLogged(uint256 indexed batchId, string eventType);
    event StatusUpdated(uint256 indexed batchId, Status newStatus);
    event PaymentReleased(uint256 indexed batchId, uint256 amount);
    event NFTMinted(uint256 indexed batchId, uint256 tokenId, string uri);

    constructor(address _usdc) ERC721("Thalexa Coffee", "THLX") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        batchCounter = 0;
    }

    function initializeBatch(
        string memory _batchId,
        string memory _origin,
        int64 _harvestDate
    ) external returns (uint256) {
        batchCounter++;
        uint256 batchId = batchCounter;

        batches[batchId] = CoffeeBatch({
            owner: msg.sender,
            batchId: _batchId,
            origin: _origin,
            harvestDate: _harvestDate,
            status: Status.Harvested,
            nftMinted: false,
            paymentReleased: false,
            nftMetadataUri: ""
        });

        emit BatchCreated(batchId, _batchId, msg.sender);
        return batchId;
    }

    function logEvent(
        uint256 _batchId,
        string memory _eventType,
        string memory _details
    ) external {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.owner == msg.sender, "Not owner");

        batchEvents[_batchId].push(Event({
            eventType: _eventType,
            details: _details,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        emit EventLogged(_batchId, _eventType);
    }

    function updateStatus(uint256 _batchId, Status _newStatus) external {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.owner == msg.sender, "Not owner");
        batch.status = _newStatus;
        emit StatusUpdated(_batchId, _newStatus);
    }

    function releasePayment(
        uint256 _batchId,
        address _receiver,
        uint256 _amount
    ) external {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.status == Status.Delivered, "Not delivered");
        require(!batch.paymentReleased, "Already paid");
        require(batch.owner == msg.sender, "Not owner");

        require(usdc.transfer(_receiver, _amount), "Transfer failed");
        batch.paymentReleased = true;

        emit PaymentReleased(_batchId, _amount);
    }

    function mintNFT(
        uint256 _batchId,
        string memory _tokenURI
    ) external returns (uint256) {
        CoffeeBatch storage batch = batches[_batchId];
        require(batch.status == Status.ReadyForSale, "Not ready");
        require(!batch.nftMinted, "NFT already minted");
        require(batch.owner == msg.sender, "Not owner");

        uint256 tokenId = batchCounter;
        _safeMint(batch.owner, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        batch.nftMinted = true;
        batch.nftMetadataUri = _tokenURI;

        emit NFTMinted(_batchId, tokenId, _tokenURI);
        return tokenId;
    }

    function getBatchEvents(uint256 _batchId) external view returns (Event[] memory) {
        return batchEvents[_batchId];
    }
}