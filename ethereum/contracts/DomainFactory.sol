pragma solidity ^0.5.0;

import "./common/Ownable.sol";
import "./Domain.sol";

contract DomainFactory is Ownable {
    /** STRUCTS */
    struct SubDomain {
        address domainAddress;
        uint domainExpiration;
    }

    /** CONSTANTS */
    // @dev - Register/extend costs at least 1 ether.
    uint constant private COST = 1 ether;

    // @dev - Expiration for 1 year.
    uint constant private EXPIRATION = 365 days;

    // @dev - Domain should have at lest 2 characters.
    uint8 constant private DOMAIN_MIN_LENGTH = 2;

    // @dev - TLD should have at least 2 characters.
    uint8 constant private TLD_MIN_LENGTH = 2;

    /** STATE VARIABLES */
    // @dev - Top level domain for the domain factory.
    string public topLevel;

    // @dev - Domain records.
    mapping(bytes32 => SubDomain) private domainRecords;


    /** CONSTRUCTOR */
    /*
     * @dev - Construct the top level domain.
     * @param tld - Top level domain.
     */
    constructor(
        string memory tld
    )
    public
    isTopLevelLengthAllowed(tld)
    {
        topLevel = tld;
    }

    /** MODIFIERS */
    /*
     * @dev - Checks if TLD length >= 2.
     * @param tld - Top level domain.
     */
    modifier isTopLevelLengthAllowed(string memory tld) {
        require(
            bytes(tld).length >= TLD_MIN_LENGTH,
            "TLD must have at least 2 characters"
        );
        _;
    }

    /*
     * @dev - Checks if domain name length >= 2.
     * @param domainName - Domain name.
     */
    modifier isDomainNameLengthAllowed(string memory domainName) {
        require(
            bytes(domainName).length >= DOMAIN_MIN_LENGTH,
            "Domain must have at least 2 characters"
        );
        _;
    }

    /*
     * @dev - Checks if the domain is registered and available.
     * @param domainName - Domain name.
     */
    modifier isRegistered(string memory domainName) {
        bytes32 domainHash = getDomainHash(domainName);
        require(
            domainRecords[domainHash].domainExpiration > block.timestamp,
            "Domain is not registered"
        );
        _;
    }

    /*
     * @dev - Checks if the domain is ready to be registered.
     * @param domainName - Domain name.
     */
    modifier notRegistered(string memory domainName) {
        bytes32 domainHash = getDomainHash(domainName);
        require(
            domainRecords[domainHash].domainExpiration < block.timestamp,
            "Domain is already registered"
        );
        _;
    }

    /*
     * @dev - Checks if the payment is sufficient.
     */
    modifier collectPayment() {
        require(
            msg.value > COST,
            "Domain price is at least 1 ether"
        );
        _;
    }

    /** FUNCTIONS */
    /** GETTERS */
    /*
     * @dev - Get Domain Hash from domain name.
     * private method only used internally.
     * @param domainName - Domain name.
     */
    function getDomainHash
    (
        string memory domainName
    )
    private
    view
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(domainName, topLevel));
    }

    /*
     * @dev - Get Domain Address if registered.
     * @param domainName - Domain name.
     */
    function getDomainAddress
    (
        string memory domainName
    )
    public
    view
    isRegistered(domainName)
    returns (address)
    {
        bytes32 domainHash = getDomainHash(domainName);
        return domainRecords[domainHash].domainAddress;
    }

    /*
     * @dev - Get Domain expiration if registered.
     * @param domainName - Domain name.
     */
    function getDomainExpiration
    (
        string memory domainName
    )
    public
    view
    isRegistered(domainName)
    returns (uint)
    {
        bytes32 domainHash = getDomainHash(domainName);
        return domainRecords[domainHash].domainExpiration;
    }

    /*
     * @dev - Register a domain if not registered/expired.
     * @param domainName - Domain name.
     */
    function register
    (
        string memory domainName
    )
    public
    payable
    isDomainNameLengthAllowed(domainName)
    notRegistered(domainName)
    collectPayment
    {
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

    /*
     * @dev - Extend the expiration for a domain.
     * @param domainName - Domain name.
     */
    function extend
    (
        string memory domainName
    )
    public
    payable
    isRegistered(domainName)
    collectPayment
    {
        bytes32 domainHash = getDomainHash(domainName);
        domainRecords[domainHash].domainExpiration += EXPIRATION;
    }

    /*
     * @dev - Make a DNS query.
     * @param recordName - "www" in "www.google.com".
     * @param domainName - "google" in "www.google.com".
     */
    function query
    (
        string memory recordName,
        string memory domainName
    )
    public
    view
    isRegistered(domainName)
    returns (string memory)
    {
        bytes32 domainHash = getDomainHash(domainName);
        address targetAddress = domainRecords[domainHash].domainAddress;
        Domain targetDomain = Domain(targetAddress);
        return targetDomain.query(recordName);
    }

    /*
     * @dev - Transfer money to owner
     */
    function withdraw()
    public
    onlyOwner
    {
        msg.sender.transfer(address(this).balance);
    }
}