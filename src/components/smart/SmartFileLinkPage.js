import React, {Component} from 'react';
import {connect} from "react-redux";
import {ipfsPath} from "../util/IPFSUtil";
import ValidFileIcon from "../dumb/ValidFileIcon";
import InvalidFileIcon from "../dumb/InvalidFileIcon";
import store from "../../redux/store/store";

class SmartFileLinkPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            linkData: {
                size: 0,
                hash: '',
                linkIsValid: undefined,
                partialDataToDisplay: ''
            },
            mainHash: '',
            linkHash: '',
            unsubscribe: undefined
        }
    }

    componentDidMount() {
        this.resolveUrl();
    }

    componentWillUnmount() {
        this.state.unsubscribe();
    }

    resolveUrl() {
        const urlParts = this.props.location.pathname.split('/');
        this.setState({
            mainHash: urlParts[2],
            linkHash: urlParts[4]
        }, () => {
            let unsubscribe = store.subscribe(() => this.getIpfsLinkData(this.state.mainHash, this.state.linkHash));
            this.setState({unsubscribe});
            this.getIpfsLinkData(this.state.mainHash, this.state.linkHash);
        });
    }

    getIpfsLinkData = async (fileHash, linkHash) => {
        if (this.props.ipfsState.uploadedFiles) {
            let foundFileHash = this.props.ipfsState.uploadedFiles
                .filter(uploadedFile => uploadedFile.fileHash === fileHash);

            if (foundFileHash.length > 0 && foundFileHash[0].links) {
                let foundLinkHash = foundFileHash[0].links
                    .filter(link => link.hash === linkHash);
                if (foundLinkHash.length > 0) {
                    this.setState({linkData: foundLinkHash[0]})
                }
            }
        }
    };

    render() {
        return (
            <div className="info-page-main-div">
                <h3>
                    Info about link <a href={ipfsPath + this.state.linkHash}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       title="Click to open the link in IPFS">
                    {this.state.linkHash}
                </a>
                    {
                        this.state.linkData.linkIsValid ?
                            <ValidFileIcon id={this.state.linkData.hash}/>
                            :
                            this.state.linkData.isValid === false ?
                                <InvalidFileIcon id={this.state.linkData.hash}/>
                                :
                                ""
                    }
                </h3>
                <div>
                    <h6>Showing the first 2000 characters of the link</h6>
                    {
                        this.state.linkData.linkIsValid === undefined ?
                            <div className="image-loader"/>
                            :
                            <textarea id="ipfs-textarea"
                                      value={this.state.linkData.partialDataToDisplay}
                                      className={this.state.linkData.linkIsValid === true ? "" : "invalid-text-area"}
                                      disabled/>
                    }
                </div>
                <p className="file-hash-p"><strong>Link size: </strong>{this.state.linkData.size} bytes</p>
                <p><strong>Nr of links: </strong>0</p>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        ipfsState: state.ipfsState
    }
};

export default connect(mapStateToProps, null)(SmartFileLinkPage);