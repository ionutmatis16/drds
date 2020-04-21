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
        <h2>After that, create an account and log in with it.</h2>
        <img id="metamask-icon" src={"logo_metamask.jpg"} alt="Metamask logo"/>
    </div>
);

export default MetamaskNotInstalled;