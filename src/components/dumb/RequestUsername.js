import React from 'react';

const RequestUsername = ({saveUsername, usernameChange, usernameHolder}) => (
    <div className="upload-form-div">
        <br/>
        <h3>Before continuing, please provide a username.</h3>
        <h3>This will be saved together with your account address.</h3>
        <br/>
        <form className="form-inline" onSubmit={saveUsername}>
            <div className="form-group row">
                <label className="col-sm-2">Username:</label>
                <div className="col-sm-10">
                    <input type="text"
                           className="form-control username-input"
                           onChange={usernameChange}
                           placeholder="Type your username"/>
                </div>
            </div>
            <input className="btn btn-dark"
                   type="submit"
                   disabled={usernameHolder === ''}/>
        </form>
    </div>
);

export default RequestUsername;