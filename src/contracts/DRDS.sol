pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; // so that I can return structs from a function

contract DRDS {

    struct InformationAuthor {
        address addr;
        string username;
    }

    struct FileInfo {
        string fileName;
        string fileHash;
    }

    mapping(address => string) userNames;

    // sa tin istoricul update-urilor
    // event pentru register / add file hash
    // event pentru un update la un fisier deja incarcat

    // ca owner ar trebuit sa poti face la update la un fisier incarcat (cu nou hash?)

    mapping(string => InformationAuthor) fileHashes;
    // first string: file-label / about what info I refer to
    // second string: new file hash
    mapping(address => mapping(string => string)) allFiles;

    mapping(address => FileInfo[]) uploadedFiles;
    // istoric il scot din event-uri
	
	// sa trimit pe frontend si hash-ul transactiei, ca un fel de bon (receipt)
    // o sa fie din event probabil

    function addFileHash(string memory _fileName, string memory _fileHash, string memory _username) public {
        require(fileHashes[_fileHash].addr == address(0), "File already in the system!");

        fileHashes[_fileHash] = InformationAuthor({addr : msg.sender, username : _username});
        uploadedFiles[msg.sender].push(FileInfo(_fileName,_fileHash));
        // TODO: add a custom event
    }

    function getAuthor(string memory _fileHash) public view returns (InformationAuthor memory author) {
        return fileHashes[_fileHash];
    }

    function addUsername(string memory _username) public {
        userNames[msg.sender] = _username;
    }

    function getUsername() public view returns (string memory) {
        return userNames[msg.sender];
    }

    function getUploadedFiles() public view returns (FileInfo[] memory) {
        return uploadedFiles[msg.sender];
    }
}