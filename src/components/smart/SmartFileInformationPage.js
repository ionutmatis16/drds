import React, {Component} from 'react';
import {ipfsPath} from "../util/IPFSUtil";
import ValidFileIcon from "../dumb/ValidFileIcon";
import InvalidFileIcon from "../dumb/InvalidFileIcon";
import {connect} from "react-redux";
import store from "../../redux/store/store";

class SmartFileInformationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            foundFileInstance: {
                fileHash: '',
                totalSize: 0,
                links: [],
                isValid: undefined,
                partialDataToDisplay: ""
            },
            fileHash: '',
            fileType: '',
            unsubscribe: undefined
        }
    }

    async componentDidMount() {
        await this.resolveUrl();
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        this.state.unsubscribe();
    }

    async resolveUrl() {
        const fileType = this.getQueryParamValue(this.props, "fileType");
        this.setState({fileType});

        const lastSlash = this.props.location.pathname.lastIndexOf('/');
        const fileHash = this.props.location.pathname.substring(lastSlash + 1);
        this.setState({fileHash},
            () => {
                let unsubscribe = store.subscribe(() => this.getIpfsData(this.state.fileHash));
                this.setState({unsubscribe});
                this.getIpfsData(this.state.fileHash);
            });
    }

    getIpfsData = async (fileHash) => {
        let foundFileHash = this.props.ipfsState.uploadedFiles
            .filter(uploadedFile => uploadedFile.fileHash === fileHash);

        if (foundFileHash.length > 0) {
            this.setState({foundFileInstance: foundFileHash[0]});
        }
    };

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
                switch (this.state.foundFileInstance.isValid) {
                    case true:
                        dataToDisplay = <img className="ipfs-image"
                                             src={(ipfsPath + this.state.foundFileInstance.fileHash)}
                                             alt="IPFS object"/>;
                        break;
                    case false:
                        dataToDisplay = <p className="image-corrupted">YOUR IMAGE IS CORRUPTED</p>;
                        break;
                    default:
                        dataToDisplay = <div className="image-loader"/>
                }
                break;
            default :
                if (this.state.foundFileInstance.isValid === undefined) {
                    dataToDisplay = <div className="image-loader"/>;
                } else {
                    dataToDisplay = <div>
                        <h6>Showing the first 2000 characters of your uploaded file</h6>
                        <textarea id="ipfs-textarea"
                                  value={this.state.foundFileInstance.partialDataToDisplay}
                                  className={this.state.foundFileInstance.isValid === true ? "" : "invalid-text-area"}
                                  disabled/>
                    </div>
                }
        }

        return (
            <div className="info-page-main-div">
                <h3>
                    Info about <a href={ipfsPath + this.state.fileHash}
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
                <p className="file-hash-p"><strong>Total size: </strong>
                    {
                        this.state.foundFileInstance !== undefined ?
                            this.state.foundFileInstance.totalSize
                            :
                            0
                    } bytes
                </p>
                <p><strong>Nr of links: </strong>
                    {
                        this.state.foundFileInstance.links !== undefined ?
                            this.state.foundFileInstance.links.length
                            :
                            0
                    }
                </p>
                <ol>
                    {
                        this.state.foundFileInstance.links !== undefined ?
                            this.state.foundFileInstance.links.map((link, index) =>
                                <div key={index}>
                                    <li>
                                        <p><strong>Link size: </strong>{link.size} bytes</p>
                                        <div className="p-ipfs-check">
                                            <p>
                                                <strong>Link hash: </strong>
                                                <a href={("#/uploaded-files/" + this.state.foundFileInstance.fileHash + "/" + link.hash)}
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
                            :
                            ""
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
