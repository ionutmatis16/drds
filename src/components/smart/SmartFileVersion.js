import React, {Component} from "react";
import {connect} from "react-redux";
import {getQueryParamValue} from "../util/ReactUtil";
import {getValidatedFile, ipfsPath} from "../util/IPFSUtil";
import ValidFileIcon from "../dumb/ValidFileIcon";
import InvalidFileIcon from "../dumb/InvalidFileIcon";
import {getFilePreview} from "../util/DRDSUtil";
import LinkPanel from "../dumb/LinkPanel";

class SmartFileVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            originalHash: '',
            selectedHash: '',
            latestHash: '',
            selectionIndex: 0,
            size: 0
        }
    }

    componentDidMount() {
        this.resolveUrl();
    }

    resolveUrl() {
        const urlParts = this.props.location.pathname.split('/');
        let selectionIndex = parseInt(getQueryParamValue(this.props.location.search, "selectionIndex"));
        let fileType = getQueryParamValue(this.props.location.search, "fileType");
        let size = getQueryParamValue(this.props.location.search, "size");
        let latestHash = getQueryParamValue(this.props.location.search, "latestHash");
        let latestHashValid = getQueryParamValue(this.props.location.search, "latestValid");

        this.setState({
            originalHash: urlParts[2],
            selectedHash: urlParts[4],
            latestHash: latestHash,
            latestHashValid: latestHashValid,
            selectionIndex: selectionIndex,
            fileType: fileType,
            size: size
        }, () => {
            if (this.props.ipfsState.selectedVersionFile.fileHash !== this.state.selectedHash) {
                this.props.onVersionFileReset();
                this.validateFileHash(this.state.selectedHash, this.props.onSelectedVersionFileChange);
            }
            if (this.props.ipfsState.originalVersionFile.fileHash !== this.state.originalHash) {
                this.validateFileHash(this.state.originalHash, this.props.onOriginalVersionFileChange);
            }
        });
    }

    validateFileHash = async (fileHash, callback) => {
        let selectedVersionFile = await getValidatedFile(fileHash, {});
        selectedVersionFile = {
            ...selectedVersionFile,
            fileHash: fileHash
        };
        callback(selectedVersionFile);
    };

    render() {
        let versionHeaderToDisplay = "";
        if (this.state.selectionIndex === 0) {
            versionHeaderToDisplay = <h6>
                Original version of
                <a href={ipfsPath + this.state.latestHash}
                   target="_blank"
                   rel="noopener noreferrer"
                   title="Click to open the link in IPFS"> {this.state.latestHash}</a>
                {
                    this.state.latestHashValid ?
                        <ValidFileIcon iconClassName="small-icon" id={this.state.latestHash}/>
                        :
                        this.state.latestHashValid === false ?
                            <InvalidFileIcon iconClassName="small-icon" id={this.state.latestHash}/>
                            :
                            ""
                }
            </h6>;
        } else {
            versionHeaderToDisplay = <h6>
                Version {this.state.selectionIndex + 1} out of {this.state.size} of the original
                <a href={ipfsPath + this.state.originalHash}
                   target="_blank"
                   rel="noopener noreferrer"
                   title="Click to open the link in IPFS"> {this.state.originalHash} </a>
                {
                    this.props.ipfsState.originalVersionFile ?
                        this.props.ipfsState.originalVersionFile.isValid ?
                            <ValidFileIcon iconClassName="small-icon" id={this.state.latestHash}/>
                            :
                            this.props.ipfsState.originalVersionFile.isValid === false ?
                                <InvalidFileIcon iconClassName="small-icon" id={this.state.latestHash}/>
                                :
                                ""
                        :
                        ""
                }
            </h6>
        }

        let dataToDisplay = "";
        if (this.props.ipfsState.selectedVersionFile) {
            dataToDisplay = getFilePreview(this.state.fileType,
                this.props.ipfsState.selectedVersionFile.isValid,
                this.state.selectedHash,
                this.props.ipfsState.selectedVersionFile.partialDataToDisplay);
        } else {
            dataToDisplay = <div className="image-loader"/>;
        }


        return (
            <div className="info-page-main-div">
                <h3>
                    Info about version <a href={ipfsPath + this.state.selectedHash}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Click to open the link in IPFS">{this.state.selectedHash}</a>
                    {
                        this.props.ipfsState.selectedVersionFile !== undefined ?
                            this.props.ipfsState.selectedVersionFile.isValid ?
                                <ValidFileIcon id={this.state.selectedHash}/>
                                :
                                this.props.ipfsState.selectedVersionFile.isValid === false ?
                                    <InvalidFileIcon id={this.state.selectedHash}/>
                                    :
                                    ""
                            :
                            ""
                    }
                </h3>
                <br/>
                {
                    versionHeaderToDisplay
                }
                {
                    dataToDisplay
                }
                <ol>
                    {
                        this.props.ipfsState.selectedVersionFile !== undefined ?
                            this.props.ipfsState.selectedVersionFile.links.map((link, index) =>
                                <div key={index}>
                                    <LinkPanel link={link}
                                               fileHash={this.state.selectedHash}
                                               isVersion={true}/>
                                </div>
                            )
                            :
                            ""
                    }
                </ol>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        ipfsState: state.ipfsState
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onSelectedVersionFileChange: (file) => dispatch({type: "VERSION_FILE_CHANGED", value: file}),
        onOriginalVersionFileChange: (file) => dispatch({type: "ORIGINAL_FILE_CHANGED", value: file}),
        onVersionFileReset: () => dispatch({type: "VERSION_FILE_RESET"})
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SmartFileVersion);