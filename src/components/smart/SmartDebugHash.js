import React, {Component} from 'react';
import {ipfsPath} from "../util/IPFSUtil";

const multibase = require("multibase");

class SmartDebugHash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileHash: undefined,
            base32encoding: '',
            filePath: ''
        }
    }

    componentDidMount() {
        this.resolveUrl();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            this.resolveUrl();
        }
    }

    resolveUrl() {
        const urlParts = this.props.location.pathname.split('/');
        let fileHash = urlParts[2];
        this.setState({fileHash}, () => {
            if (fileHash.startsWith("Qm") && fileHash.length === 46) {
                fileHash = 'z' + fileHash;
                let hashBuffer = multibase.decode(Buffer.from(fileHash));
                let encoded32Buffer = multibase.encode('base32', hashBuffer);
                this.getFilePath(encoded32Buffer);
            }
        });
    }

    getFilePath(buffer) {
        let stringBuffer = buffer.toString();
        let stringPath = this.nexToLast(stringBuffer) + "\\" + stringBuffer.slice(1);
        this.setState({
            base32encoding: stringBuffer,
            filePath: (stringPath.toUpperCase() + ".data")
        });
    }

    nexToLast(base32cid) {
        const nextToLastLen = 2;
        let offset = base32cid.length - nextToLastLen - 1;

        return base32cid.slice(offset, offset + 2);
    }

    copyPath = () => {
        navigator.clipboard.writeText(this.state.filePath);
    };

    render() {
        return (
            <div className="info-page-main-div">
                <h3>
                    Info about <a href={ipfsPath + this.state.fileHash}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Click to open the link in IPFS">{this.state.fileHash}</a>
                </h3>
                <br/>
                <h5>Base 32 encoding value: <span className="blue-color">{this.state.base32encoding}</span></h5>
                <h5>
                    <span className="center-middle">
                        File path: <span id="file-path" className="blue-color">{this.state.filePath}</span>
                    </span>
                    <button className="btn btn-light see-details-button copy-button"
                            onClick={this.copyPath}>
                        Copy path
                    </button>
                </h5>
            </div>
        );
    }
}

export default SmartDebugHash;