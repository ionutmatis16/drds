import React from "react";
import {ipfsPath} from "../util/IPFSUtil";
import Modal from "react-bootstrap/Modal";
import ValidFileIcon from "./ValidFileIcon";
import InvalidFileIcon from "./InvalidFileIcon";
import ReactTooltip from "react-tooltip";

const FilePanel = ({fileInfo, eventToDisplay, toggleModalState, onFileEdit}) => (
    <div className="uploaded-file-div">
        <div className="file-name-div">
            <p><strong>Name: </strong>{fileInfo.fileName}</p>
            <span>
                <button data-for={("edit-" + fileInfo.fileHash)}
                        data-tip="Upload the edited file. It will be submitted automatically."
                        className="btn btn-warning edit-button see-details-button"
                        onClick={() => onFileEdit(fileInfo.fileHash)}>
                    Edit
                </button>
                <input id={("file-input-edit-" + fileInfo.fileHash)} type="file" hidden/>
                <ReactTooltip id={("edit-" + fileInfo.fileHash)}
                              className="opacity-1"
                              textColor="black"
                              backgroundColor="#ffc107"
                              effect="solid"/>
                <button className="btn btn-primary see-details-button"
                        disabled={fileInfo.isValid === undefined}
                        onClick={() => {
                            let fileType = fileInfo.fileName.substring(fileInfo.fileName.lastIndexOf(".") + 1);
                            window.location.assign(("#/uploaded-files/" + fileInfo.fileHash + "?fileType=" + fileType));
                        }}>
                    See details
                </button>
            </span>
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
                        <span className="validity-loader"/>
            }
        </div>
        <p className="file-hash-p">
            <strong>Ethereum Transaction hash: </strong>
            {
                eventToDisplay === undefined ?
                    ""
                    :
                    <span className="tx-hash-button"
                          onClick={() => toggleModalState(eventToDisplay.transactionHash, true)}>
                {eventToDisplay.transactionHash}
                </span>
            }

            <Modal show={eventToDisplay === undefined ? false : eventToDisplay.showModal}
                   onHide={() => {
                       if (eventToDisplay !== undefined) {
                           toggleModalState(eventToDisplay.transactionHash, false)
                       }
                   }}>
                <Modal.Header closeButton>
                    <Modal.Title>Ethereum Transaction Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <strong>Event type: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.eventType}
                    </p>
                    <p>
                        <strong>Contract address: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.contractAddress}
                    </p>
                    <p>
                        <strong>Block hash: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.blockHash}
                    </p>
                    <p>
                        <strong>Block number: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.blockNumber}
                    </p>
                    {
                        eventToDisplay !== undefined ?
                            eventToDisplay.eventType === "FileHashAdded" ?
                                <p>
                                    <strong>IPFS file hash: </strong>
                                    {eventToDisplay === undefined ? '' : eventToDisplay.fileHash}
                                </p>
                                :
                                <div>
                                    <p>
                                        <strong>Original IPFS file hash: </strong>
                                        {eventToDisplay.firstFileHash}
                                    </p>
                                    <p>
                                        <strong>Edited IPFS file hash: </strong>
                                        {eventToDisplay.newFileHash}
                                    </p>
                                </div>
                            :
                            ""
                    }
                    <p>
                        <strong>Author address: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.authorAddress}
                    </p>
                    <p>
                        <strong>Ethereum transaction hash: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.transactionHash}
                    </p>
                    <p>
                        <strong>Transaction index: </strong>
                        {eventToDisplay === undefined ? '' : eventToDisplay.transactionIndex}
                    </p>
                </Modal.Body>
            </Modal>
        </p>
    </div>
);

export default FilePanel;