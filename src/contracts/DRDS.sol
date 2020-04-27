pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; // so that I can return structs from a function

contract DRDS {

    struct FileInfo {
        string fileName;
        string fileHash;
    }

    event FileHashAdded(address indexed userAddress, string fileHash);

    // sa tin istoricul update-urilor
    // event pentru register / add file hash
    // event pentru un update la un fisier deja incarcat

    // ca owner ar trebuit sa poti face la update la un fisier incarcat (cu nou hash?)

    mapping(string => address) fileHashes;
    // first string: file-label / about what info I refer to. First file hash?
    // second string: new, edited file hash
    // SAU
    // first string: file name (ex: poza1.jpg)
    // second string: file hash
    mapping(address => mapping(string => string)) allFiles;

    mapping(address => FileInfo[]) uploadedFiles;
    // istoric il scot din event-uri

    function addFileHash(string memory _fileName, string memory _fileHash) public {
        require(fileHashes[_fileHash] == address(0), "File already in the system!");

        fileHashes[_fileHash] = msg.sender;
        uploadedFiles[msg.sender].push(FileInfo(_fileName, _fileHash));
        emit FileHashAdded(msg.sender, _fileHash);
    }

    function getUploadedFiles() public view returns (FileInfo[] memory) {
        return uploadedFiles[msg.sender];
    }
}