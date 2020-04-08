import React, {Component} from 'react';

const ipfsClient = require('ipfs-http-client');

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://localhost:5001');
const ipfsPath = "http://localhost:8080/ipfs/";

class IPFSUtil {

    constructor(props) {
        this.state = {
            fileHash: localStorage.getItem("fileHash")
        };
    }


}

const ipfsUtil = new IPFSUtil();

export default ipfsUtil;

