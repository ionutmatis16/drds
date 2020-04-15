import React from "react";

const ipfsPath = "http://localhost:8080/ipfs/";

const FilePanel = ({fileInfo}) => (
    <div className="uploaded-file-div">
        <div className="file-name-div">
            <p><strong>Name: </strong>{fileInfo.fileName}</p>
            <button className="btn btn-success see-details-button"
                    onClick={() => window.location.assign(("#/uploaded-files/" + fileInfo.fileHash))}>
                See details
            </button>
        </div>
        <p className="file-hash-p"><strong>Hash: </strong>
            <a href={ipfsPath + fileInfo.fileHash}
               target="_blank"
               rel="noopener noreferrer"
               title="Click to open the link in IPFS">
                {fileInfo.fileHash}
            </a></p>
    </div>
);

export default FilePanel;