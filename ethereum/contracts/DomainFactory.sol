pragma solidity ^0.5.0;

import "./common/Ownable.sol";
import "./Domain.sol";

contract DomainFactory is Ownable {
    struct SubDomain {
        address domainAddress;
        uint domainExpiration;
    }

    /** CONSTANTS */
    uint constant private COST = 1 ether;
    uint constant private EXPIRATION = 365 days;
    uint8 constant private DOMAIN_MIN_LENGTH = 2;
    uint8 constant private TLD_MIN_LENGTH = 2;

    /** STATE VARIABLES */
    string public topLevel;

    mapping(bytes32 => SubDomain) private domainRecords;


    /** CONSTRUCTOR */
    constructor(
        string memory tld
    )
    public
    isTopLevelLengthAllowed(tld)
    {
        topLevel = tld;
    }

    /** MODIFIERS */
    modifier isTopLevelLengthAllowed(string memory tld) {
        require(
            bytes(tld).length >= TLD_MIN_LENGTH,
            "TLD must have at least 2 characters"
        );
        _;
    }

    modifier isDomainNameLengthAllowed(string memory domainName) {
        require(
            bytes(domainName).length >= DOMAIN_MIN_LENGTH,
            "Domain must have at least 2 characters"
        );
        _;
    }

    modifier isRegistered(string memory domainName) {
        bytes32 domainHash = getDomainHash(domainName);
        require(
            domainRecords[domainHash].domainExpiration > block.timestamp,
            "Domain is not registered"
        );
        _;
    }

    modifier notRegistered(string memory domainName) {
        bytes32 domainHash = getDomainHash(domainName);
        require(
            domainRecords[domainHash].domainExpiration < block.timestamp,
            "Domain is already registered"
        );
        _;
    }

    modifier collectPayment() {
        require(
            msg.value > COST,
            "Domain price is at least 1 ether"
        );
        _;
    }

    /** FUNCTIONS */
    /** GETTERS */
    function getDomainHash(string memory domainName) private view returns (bytes32) {
        return keccak256(abi.encodePacked(domainName, topLevel));
    }

    function getDomainAddress(string memory domainName) public view isRegistered(domainName) returns (address) {
        bytes32 domainHash = getDomainHash(domainName);
        return domainRecords[domainHash].domainAddress;
    }

    function getDomainExpiration(string memory domainName) public view isRegistered(domainName) returns (uint) {
        bytes32 domainHash = getDomainHash(domainName);
        return domainRecords[domainHash].domainExpiration;
    }

    function register(string memory domainName) public payable isDomainNameLengthAllowed(domainName) notRegistered(domainName) collectPayment {
        address newDomain = address(new Domain(domainName, topLevel));
        bytes32 domainHash = getDomainHash(domainName);
        SubDomain memory newStruct = SubDomain(
            {
                domainAddress: newDomain,
                domainExpiration: block.timestamp + EXPIRATION
            }
        );
        domainRecords[domainHash] = newStruct;
    }

    function extend(string memory domainName) public payable isRegistered(domainName) collectPayment {
        bytes32 domainHash = getDomainHash(domainName);
        domainRecords[domainHash].domainExpiration += EXPIRATION;
    }

    function query(string memory recordName, string memory domainName) public view isRegistered(domainName) returns (string memory) {
        bytes32 domainHash = getDomainHash(domainName);
        address targetAddress = domainRecords[domainHash].domainAddress;
        Domain targetDomain = Domain(targetAddress);
        return targetDomain.query(recordName);
    }

    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}