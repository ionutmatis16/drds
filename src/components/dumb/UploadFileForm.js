import React from 'react';

const UploadFileForm = ({onSubmit, captureFile, chooseFileDisabled, buffer}) => (
    <div className="upload-form-div">
        <h2>Upload a file</h2>
        <form onSubmit={onSubmit}>
            <input className="btn"
                   type="file"
                   onChange={captureFile}
                   disabled={chooseFileDisabled}/>
            <input className="btn btn-dark"
                   type="submit"
                   disabled={buffer === null}/>
        </form>
    </div>
);

export default UploadFileForm;