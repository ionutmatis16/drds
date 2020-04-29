import React from 'react';
import FilePanel from "./FilePanel";

const UploadedFilesPanel = ({uploadedFiles, eventsToDisplay, toggleModalState, onFileEdit}) => (
    <div>
        <div id="uploaded-files-div">
            <h2>Your uploaded files:</h2>
            {
                uploadedFiles.map((fileInfo, index) => {
                        return <div key={index}>
                            <FilePanel fileInfo={fileInfo}
                                       eventToDisplay={eventsToDisplay[index]}
                                       toggleModalState={toggleModalState}
                                       onFileEdit={onFileEdit}/>
                        </div>
                    }
                )
            }
        </div>
    </div>
);

export default UploadedFilesPanel;