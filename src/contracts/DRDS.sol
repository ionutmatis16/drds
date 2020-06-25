pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; // so that I can return structs from a function

contract DRDS {

    struct FileInfo {
        string fileName;
        string fileHash;
    }

    mapping(string => address) fileHashes;
    mapping(string => FileInfo) firstVersionOfFile;
    mapping(string => FileInfo) latestVersionOfFile;
    mapping(address => FileInfo[]) uploadedFiles;

    event FileHashAdded(address indexed userAddress, string fileName, string fileHash);
    event FileEdited(address indexed userAddress, string firstFileHash, string newFileName, string newFileHash);

    function addFileHash(string memory _fileName, string memory _fileHash) public {
        require(fileHashes[_fileHash] == address(0), "File already in the system!");

        fileHashes[_fileHash] = msg.sender;
        uploadedFiles[msg.sender].push(FileInfo(_fileName, _fileHash));

        firstVersionOfFile[_fileHash] = FileInfo(_fileName, _fileHash);
        latestVersionOfFile[_fileHash] = FileInfo(_fileName, _fileHash);

        emit FileHashAdded(msg.sender, _fileName, _fileHash);
    }

    function editFile(string memory _oldFileHash, string memory _newFileName, string memory _newFileHash) public {
        require(fileHashes[_oldFileHash] == msg.sender, "You did not upload that file!");
        require(fileHashes[_newFileHash] == address(0), "The new version of your file was already uploaded!");

        FileInfo memory _firstFileInfo = firstVersionOfFile[_oldFileHash];
        string memory latestVersionFileInfoHash = latestVersionOfFile[_firstFileInfo.fileHash].fileHash;
        require(keccak256(bytes(latestVersionFileInfoHash)) == keccak256(bytes(_oldFileHash)),
            "You can edit only the last version of your file!");

        latestVersionOfFile[_firstFileInfo.fileHash] = FileInfo(_newFileName, _newFileHash);
        firstVersionOfFile[_newFileHash] = FileInfo(_firstFileInfo.fileName, _firstFileInfo.fileHash);
        fileHashes[_newFileHash] = msg.sender;

        emit FileEdited(msg.sender, _firstFileInfo.fileHash, _newFileName, _newFileHash);
    }

    function getUploadedFiles() public view returns (FileInfo[] memory) {
        return uploadedFiles[msg.sender];
    }

    function getLatestVersionOfFile(string memory _firstFileHash) public view returns (FileInfo memory) {
        return latestVersionOfFile[_firstFileHash];
    }

    function getFirstVersionOfFile(string memory _editedFileHash) public view returns (FileInfo memory) {
        return firstVersionOfFile[_editedFileHash];
    }
}