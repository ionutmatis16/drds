import React, {Component} from 'react';
import {getPartialData, ipfsPath} from "../util/IPFSUtil";
import ValidFileIcon from "../dumb/ValidFileIcon";
import InvalidFileIcon from "../dumb/InvalidFileIcon";
import {connect} from "react-redux";

class SmartFileInformationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            foundFileInstance: {
                fileHash: '',
                totalSize: 0,
                links: [],
                isValid: undefined,
                partialDataToDisplay: "da" // will be received from ipfs get
            },
            fileType: '',
        }
    }

    async componentDidMount() {
        await this.resolveUrl();
    }

    async componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            await this.resolveUrl();
        }
    }

    async resolveUrl() {
        const fileType = this.getQueryParamValue(this.props, "fileType");
        this.setState({fileType});

        const lastSlash = this.props.location.pathname.lastIndexOf('/');
        const fileHash = this.props.location.pathname.substring(lastSlash + 1);

        let foundFileHash = this.props.ipfsState.uploadedFiles
            .filter(uploadedFile => uploadedFile.fileHash === fileHash);

        if (foundFileHash.length > 0) {
            let fileInstance = foundFileHash[0];
            let partialData;
            if (foundFileHash[0].isValid) {
                partialData = await getPartialData(fileInstance.fileHash, 2000);
            } else {
                partialData = "INVALID FILE"
            }
            fileInstance = {
                ...foundFileHash[0],
                partialDataToDisplay: partialData
            };
            this.setState({foundFileInstance: fileInstance});
        } else {
            window.location.assign("#/");
        }

        let textArea = document.getElementById("ipfs-textarea");
        if (textArea) {
            textArea.scroll(0, 0);
        }

    }

    getQueryParamValue(props, queryParam) {
        let url = props.location.search;
        let questionMark = url.indexOf("?");
        let params = props.location.search.substring(questionMark + 1).split("&");

        for (let i = 0; i < params.length; i++) {
            let paramSplit = params[i].split("=");
            if (paramSplit[0] === queryParam) {
                return paramSplit[1];
            }
        }

        return '';
    }

    render() {
        let dataToDisplay = "";

        switch (this.state.fileType) {
            case "jpg":
            case "jpeg":
            case "png":
                if (this.state.foundFileInstance.fileHash !== "") {
                    if (this.state.foundFileInstance.isValid) {
                        dataToDisplay = <img className="ipfs-image"
                                             src={(ipfsPath + this.state.foundFileInstance.fileHash)}
                                             alt="IPFS object"/>;
                    } else {
                        dataToDisplay = <p className="image-corrupted">YOUR IMAGE IS CORRUPTED</p>;
                    }
                } else {
                    dataToDisplay = <div className="image-loader"/>
                }
                break;
            default :
                dataToDisplay = <div>
                    <h6>Showing the first 2000 characters of your uploaded file</h6>
                    <textarea id="ipfs-textarea"
                              value={this.state.foundFileInstance.partialDataToDisplay}
                              className={this.state.foundFileInstance.isValid === true ? "" : "invalid-text-area"}
                              disabled/>
                </div>
        }

        return (
            <div className="info-page-main-div">
                <h3>
                    Info about <a href={ipfsPath + this.state.foundFileInstance.fileHash}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Click to open the link in IPFS">
                    {this.state.foundFileInstance.fileHash}
                </a>
                    {
                        this.state.foundFileInstance.isValid ?
                            <ValidFileIcon id={this.state.foundFileInstance.fileHash}/>
                            :
                            this.state.foundFileInstance.isValid === false ?
                                <InvalidFileIcon id={this.state.foundFileInstance.fileHash}/>
                                :
                                ""
                    }
                </h3>
                {
                    dataToDisplay
                }
                <p className="file-hash-p"><strong>Total size: </strong>{this.state.foundFileInstance.totalSize} bytes</p>
                <p><strong>Nr of links: </strong>{this.state.foundFileInstance.links.length}</p>
                <ol>
                    {
                        this.state.foundFileInstance.links.map((link, index) =>
                            <div key={index}>
                                <li>
                                    <p><strong>Link size: </strong>{link.size} bytes</p>
                                    <div className="p-ipfs-check">
                                        <p>
                                            <strong>Link hash: </strong>
                                            <a href={("#/uploaded-files/" + link.hash)}
                                               title="Click to open the link in DRDS">
                                                {" " + link.hash}
                                            </a>
                                        </p>
                                        {
                                            link.linkIsValid ?
                                                <ValidFileIcon id={link.hash}/>
                                                :
                                                link.linkIsValid === false ?
                                                    <InvalidFileIcon id={link.hash}/>
                                                    :
                                                    ""
                                        }
                                    </div>
                                </li>
                                <hr/>
                            </div>
                        )
                    }
                </ol>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        ipfsState: state.ipfsState
    }
};

export default connect(mapStateToProps, null)(SmartFileInformationPage);
