pragma solidity ^0.5.0;

contract DRDS {
    mapping (string => address) fileHashes;

    function addFileHash(string memory _fileHash) public {
        if(fileHashes[_fileHash] != address(0)) {
            revert("File already in the system!");
        }
        fileHashes[_fileHash] = msg.sender;
    }

    function getAuthor(string memory _fileHash) public view returns (address) {
        return fileHashes[_fileHash];
    }
}