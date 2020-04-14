pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; // so that I can return structs from a function

contract DRDS {

    struct InformationAuthor {
        address addr;
        string username;
    }

    // sa tin istoricul update-urilor
    // event pentru register / add file hash
    // event pentru un update la un fisier deja incarcat

    // ca owner ar trebuit sa poti face la update la un fisier incarcat (cu nou hash?)

    mapping(string => InformationAuthor) fileHashes;
   /* mapping(InformationAuthor *//*ori adresa*//*=> mapping(string *//*label fisier, depsre ce info vb*//*
=> string *//*ultima versiune incarcata, hash-ul ei*//*));
    mapping(InformationAuthor => string[]);*/
    // istoric il scot din event-uri
	
	// sa trimit pe frontent si hash-ul transactiei, ca un fel de bon (receipt)

    function addFileHash(string memory _fileHash, string memory _username) public {
        require(fileHashes[_fileHash].addr == address(0), "File already in the system!");

        fileHashes[_fileHash] = InformationAuthor({addr : msg.sender, username : _username});
    }

    function getAuthor(string memory _fileHash) public view returns (InformationAuthor memory author) {
        return fileHashes[_fileHash];
    }
}