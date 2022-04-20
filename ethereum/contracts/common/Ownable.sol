pragma solidity >=0.4.22 <0.6.0;

/**
 * @title Ownable
 * @dev - The Ownable contract has an owner address, and provides basic
 * authorization control functions, this simplifies the implementation
 * of "user permission".
 */
contract Ownable {
    address private _owner;

    /*
     * @dev - The Ownable constructor sets the original `owner` of
     * the contract to the sender account.
     */
    constructor() public {
        _owner = msg.sender;
    }

    /*
     * @dev - Throws if called by an account other than the owner.
     */
    modifier onlyOwner() {
        require(
            isOwner(),
            "Permission denied"
        );
        _;
    }

    /*
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /*
     * @return the address of the owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /*
     * @dev - Allows the current owner to transfer control of the content
     * to a new owner.
     * @param newOwner - The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /*
     * @dev - Transfer control of the contract to a newOwner.
     * @param newOwner - The address to transfer owership to.
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        _owner = newOwner;
    }
}
