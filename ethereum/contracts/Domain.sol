pragma solidity ^0.5.0;

import "./common/Ownable.sol";

/*
 * @title Domain
 * @dev - Contract for Domain.
 */
contract Domain is Ownable {
    /** STATE VARIABLES */
    // @dev - Storing the TLD.
    string public tld;

    // @dev - Storing the domain name.
    string public domain;

    // @dev - Storing the domain recores.
    mapping(bytes32 => string) private domainRecords;

    /** CONSTRUCTOR */
    /*
     * @dev - Construct the domain contract.
     * @param domainName - Domain name for the contract.
     * @param domainTLD - Top Level Domain for the sub domain.
    */
    constructor(
        string memory domainName,
        string memory domainTLD
    ) public {
        domain = domainName;
        tld = domainTLD;
    }

    /** MODIFIERS */
    /*
     * @dev - Checks if the record exists.
     * @param name: record name.
     */
    modifier recordExists(string memory name) {
        // @dev - Compute record hash given the record name.
        bytes32 recordHash = getRecordHash(name);
        // @dev - Retrieve the record value given the record hash.
        string memory value = domainRecords[recordHash];
        // @dev - Checks if the record value is empty.
        require(
            bytes(value).length > 0,
            "Unkwown host"
        );
        _;
    }

    /** FUNCTIONS */
    /*
     * @dev - Compute the record hash given the record name.
     * @param name - record name.
     */
    function getRecordHash(
        string memory name
    ) private
    view
    returns (bytes32) {
        // @dev - Tightly pack parameters in struct for keccak256
        return keccak256(abi.encodePacked(name, domain, tld));
    }

    /*
     * @dev - Query the record value.
     * @param name - record name.
     */
    function query(
        string memory name
    ) public
    view
    recordExists(name)
    returns (string memory) {
        // @dev - Compute record hash given the record name.
        bytes32 recordHash = getRecordHash(name);
        // @dev - Return the record value given the record hash.
        return domainRecords[recordHash];
    }

    /*
     * @dev - Reset the record value to empty string.
     * @param name - record name.
     */
    function reset(
        string memory name
    ) public
    onlyOwner
    recordExists(name) {
        // @dev - Compute record hash given the record name.
        bytes32 recordHash = getRecordHash(name);
        // @dev - Reset the record value to empty string.
        domainRecords[recordHash] = '';
    }

    /*
     * @dev - Create/update the record value.
     * @param name - record name.
     * @param value - record value.
     */
    function set(string memory name, string memory value) public onlyOwner {
        // @dev - Compute record hash given the record name.
        bytes32 recordHash = getRecordHash(name);
        // @dev - Set the record value given the record hash.
        domainRecords[recordHash] = value;
    }
}
