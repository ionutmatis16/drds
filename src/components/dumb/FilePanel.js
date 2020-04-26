import React from "react";
import {ipfsPath} from "../util/IPFSUtil";
import Modal from "react-bootstrap/Modal";
import ValidFileIcon from "./ValidFileIcon";
import InvalidFileIcon from "./InvalidFileIcon";

const FilePanel = ({fileInfo, fileHashAddedEvent, toggleModalState}) => (
    <div className="uploaded-file-div">
        <div className="file-name-div">
            <p><strong>Name: </strong>{fileInfo.fileName}</p>
            <button className="btn btn-primary see-details-button"
                    disabled={fileInfo.isValid === undefined}
                    onClick={() => {
                        let fileType = fileInfo.fileName.substring(fileInfo.fileName.lastIndexOf(".") + 1);
                        window.location.assign(("#/uploaded-files/" + fileInfo.fileHash + "?fileType=" + fileType));
                    }}>
                See details
            </button>
        </div>
        <div className="p-ipfs-check">
            <p><strong>IPFS File hash: </strong>
                <a href={ipfsPath + fileInfo.fileHash}
                   target="_blank"
                   rel="noopener noreferrer"
                   title="Click to open the link in IPFS">
                    {fileInfo.fileHash}
                </a>
            </p>
            {
                fileInfo.isValid ?
                    <ValidFileIcon id={fileInfo.fileHash}/>
                    :
                    fileInfo.isValid === false ?
                        <InvalidFileIcon id={fileInfo.fileHash}/>
                        :
                        ""
            }
        </div>
        <p className="file-hash-p">
            <strong>Ethereum Transaction hash: </strong>
            {
                fileHashAddedEvent === undefined ?
                    ""
                    :
                    <span className="tx-hash-button"
                          onClick={() => toggleModalState(fileHashAddedEvent.transactionHash, true)}>
                {fileHashAddedEvent.transactionHash}
                </span>
            }

            <Modal show={fileHashAddedEvent === undefined ? false : fileHashAddedEvent.showModal}
                   onHide={() => {
                       if (fileHashAddedEvent !== undefined) {
                           toggleModalState(fileHashAddedEvent.transactionHash, false)
                       }
                   }}>
                <Modal.Header closeButton>
                    <Modal.Title>Ethereum Transaction Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <strong>Contract address: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.contractAddress}
                    </p>
                    <p>
                        <strong>Block hash: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.blockHash}
                    </p>
                    <p>
                        <strong>Block number: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.blockNumber}
                    </p>
                    <p>
                        <strong>IPFS file hash: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.fileHash}
                    </p>
                    <p>
                        <strong>Author address: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.authorAddress}
                    </p>
                    <p>
                        <strong>Ethereum transaction hash: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.transactionHash}
                    </p>
                    <p>
                        <strong>Transaction index: </strong>
                        {fileHashAddedEvent === undefined ? '' : fileHashAddedEvent.transactionIndex}
                    </p>
                </Modal.Body>
            </Modal>
        </p>
    </div>
);

export default FilePanel;