import React from 'react';

const ipfsPath = "http://localhost:8080/ipfs/";

const MainPanel = ({ipfsHash, onSubmit, captureFile, buffer}) => (
    <div>
        <h1>Data Reliability using Decentralized Systems</h1>
        <img id="ipfs-image" src={(ipfsPath + ipfsHash)} alt="Ipfs hash"/>
        <br/>
        <br/>
        <br/>
        <h2>Upload a file</h2>
        <form onSubmit={onSubmit}>
            <input type="file" onChange={captureFile}/>
            <input type="submit" disabled={buffer === null}/>
        </form>
    </div>
);

export default MainPanel;