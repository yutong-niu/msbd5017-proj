pragma solidity ^0.5.0;

import "./common/Ownable.sol";
import "./Domain.sol";

contract DomainFactory is Ownable {

    /** CONSTANTS */
    uint constant private COST = 1 ether;
    uint constant private EXPIRATION = 365 days;
    uint8 constant private DOMAIN_MIN_LENGTH = 2;
    uint8 constant private TLD_MIN_LENGTH = 2;

    /** STATE VARIABLES */
    string public topLevel;

    mapping(bytes32 => address) private nameToAddress;
    mapping(address => address[]) private userToAddress;
    mapping(address => uint) private expires;

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

    modifier isRegistered(string memory domainName) {
        require(
            _isRegistered(domainName),
            "Domain is not registered"
        );
        _;
    }

    modifier isAvailable(string memory domainName) {
        require(
            bytes(domainName).length >= DOMAIN_MIN_LENGTH,
            "Domain must have at least 2 characters"
        );
        require(
            ! _isRegistered(domainName),
            "Domain is not available"
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
    function getDomainHash(string memory domainName) private view returns (bytes32) {
        return keccak256(abi.encodePacked(domainName, topLevel));
    }

    function getDomainAddress(string memory domainName) public view isRegistered(domainName) returns (address) {
        bytes32 domainHash = getDomainHash(domainName);
        return nameToAddress[domainHash];
    }

    function _isRegistered(string memory domainName) private view returns (bool) {
        return expires[nameToAddress[getDomainHash(domainName)]] > block.timestamp;
    }

    function register(string memory domainName) public payable isAvailable(domainName) collectPayment {
        address newDomain = address(new Domain(domainName, topLevel));
        bytes32 domainHash = getDomainHash(domainName);
        nameToAddress[domainHash] = newDomain;
        userToAddress[tx.origin].push(newDomain);
        expires[newDomain] = block.timestamp + EXPIRATION;
    }

    function extend(string memory domainName) public payable isRegistered(domainName) collectPayment {
        bytes32 domainHash = getDomainHash(domainName);
        address domainAddress = nameToAddress[domainHash];
        expires[domainAddress] += 365 days;
    }

    function query(string memory recordName, string memory domainName) public view isRegistered(domainName) returns (string memory) {
        bytes32 domainHash = getDomainHash(domainName);
        address domainAddress = nameToAddress[domainHash];
        Domain targetDomain = Domain(domainAddress);
        return targetDomain.query(recordName);
    }
}
