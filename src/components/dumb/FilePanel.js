import React from "react";
import {ipfsPath} from "../util/IPFSUtil";

const FilePanel = ({fileInfo, txHash}) => (
    <div className="uploaded-file-div">
        <div className="file-name-div">
            <p><strong>Name: </strong>{fileInfo.fileName}</p>
            <button className="btn btn-success see-details-button"
                    onClick={() => window.location.assign(("#/uploaded-files/" + fileInfo.fileHash))}>
                See details
            </button>
        </div>
        <p><strong>IPFS File hash: </strong>
            <a href={ipfsPath + fileInfo.fileHash}
               target="_blank"
               rel="noopener noreferrer"
               title="Click to open the link in IPFS">
                {fileInfo.fileHash}
            </a>
        </p>
        <p className="file-hash-p"><strong>Ethereum Transaction hash: </strong>
            {txHash}
        </p>
    </div>
);

export default FilePanel;