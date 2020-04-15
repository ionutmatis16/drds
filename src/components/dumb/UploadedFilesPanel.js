import React from 'react';
import FilePanel from "./FilePanel";

const UploadedFilesPanel = ({uploadedFiles}) => (
    <div>
        <div id="uploaded-files-div">
            <h2>Your uploaded files:</h2>
            {
                uploadedFiles.map((fileInfo, index) =>
                    <div key={index}>
                        < FilePanel fileInfo={fileInfo}/>
                    </div>
                )
            }
        </div>
    </div>
);

export default UploadedFilesPanel;