import React from 'react';

const UploadFileForm = ({onSubmit, captureFile, fileBuffer}) => (
    <div className="upload-form-div">
        <h2>Upload a file</h2>
        <form onSubmit={onSubmit}>
            <input className="btn"
                   type="file"
                   onChange={captureFile}/>
            <input className="btn btn-dark"
                   type="submit"
                   disabled={fileBuffer === null}/>
        </form>
    </div>
);

export default UploadFileForm;