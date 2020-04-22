import React from 'react';
import FilePanel from "./FilePanel";

const UploadedFilesPanel = ({uploadedFiles, fileHashAddedEvents, toggleModalState}) => (
    <div>
        <div id="uploaded-files-div">
            <h2>Your uploaded files:</h2>
            {
                uploadedFiles.map((fileInfo, index) => {
                        return <div key={index}>
                            <FilePanel fileInfo={fileInfo}
                                       fileHashAddedEvent={fileHashAddedEvents[index]}
                                       toggleModalState={toggleModalState}/>
                        </div>
                    }
                )
            }
        </div>
    </div>
);

export default UploadedFilesPanel;