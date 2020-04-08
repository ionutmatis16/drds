pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; // so that I can return structs from a function

contract DRDS {

    struct InformationAuthor {
        address addr;
        string username;
    }

    mapping(string => InformationAuthor) fileHashes;

    function addFileHash(string memory _fileHash, string memory _username) public {
        if (fileHashes[_fileHash].addr != address(0)) {
            revert("File already in the system!");
        }

        fileHashes[_fileHash] = InformationAuthor({addr : msg.sender, username : _username});
    }

    function getAuthor(string memory _fileHash) public view returns (InformationAuthor memory author) {
        return fileHashes[_fileHash];
    }
}