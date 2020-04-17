import React from 'react';
import FilePanel from "./FilePanel";

const UploadedFilesPanel = ({uploadedFiles, txInfos}) => (
    <div>
        <div id="uploaded-files-div">
            <h2>Your uploaded files:</h2>
            {
                uploadedFiles.map((fileInfo, index) => {
                    let txHash = txInfos.filter(tx => tx.fileIndex === index);
                    if (txHash.length > 0) {
                        txHash = txHash[0].txHash
                    }
                    return <div key={index}>
                        <FilePanel fileInfo={fileInfo}
                                   txHash={txHash}/>
                    </div>
                }
            )
            }
        </div>
    </div>
);

export default UploadedFilesPanel;