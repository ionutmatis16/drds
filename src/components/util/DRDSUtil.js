import {ipfsPath} from "./IPFSUtil";
import React from "react";

export function getFilePreview(fileType, isValid, fileHash, partialDataToDisplay) {
    let dataToDisplay = '';

    switch (fileType) {
        case "jpg":
        case "jpeg":
        case "png":
            switch (isValid) {
                case true:
                    dataToDisplay = <img className="ipfs-image"
                                         src={(ipfsPath + fileHash)}
                                         alt="IPFS object"/>;
                    break;
                case false:
                    dataToDisplay = <p className="image-corrupted">YOUR IMAGE IS CORRUPTED</p>;
                    break;
                default:
                    dataToDisplay = <div className="image-loader"/>
            }
            break;
        default :
            if (isValid === undefined) {
                dataToDisplay = <div className="image-loader"/>;
            } else {
                dataToDisplay = <div>
                    <h6>Showing the first 2000 characters of your uploaded file</h6>
                    <textarea id="ipfs-textarea"
                              value={partialDataToDisplay}
                              className={isValid === true ? "" : "invalid-text-area"}
                              disabled/>
                </div>
            }
    }

    return dataToDisplay;
}
