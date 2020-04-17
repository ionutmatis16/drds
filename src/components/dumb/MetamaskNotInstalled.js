import React from 'react';

const metamaskLink = "https://metamask.io/";

const MetamaskNotInstalled = () => (
    <div className="main-panel-div">
        <h1>Welcome to DRDS!</h1>
        <h2>In order to use this application, please install
            <a href={metamaskLink}
               target="_blank"
               rel="noopener noreferrer">
                Metamask
            </a>.
        </h2>
        <h2>After that, log into your account and refresh the page.</h2>
        <img id="metamask-icon" src={"logo_metamask.jpg"} alt="Metamask logo"/>
    </div>
);

export default MetamaskNotInstalled;