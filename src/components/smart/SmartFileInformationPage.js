import React, {Component} from 'react';
import {ipfsPath} from "../util/IPFSUtil";
import ValidFileIcon from "../dumb/ValidFileIcon";
import InvalidFileIcon from "../dumb/InvalidFileIcon";
import {connect} from "react-redux";
import store from "../../redux/store/store";
import {getQueryParamValue} from "../util/ReactUtil";
import {getFilePreview} from "../util/DRDSUtil";
import LinkPanel from "../dumb/LinkPanel";

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
            unsubscribe: undefined,
            originalFileHash: '',
            versions: []
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
        const fileType = getQueryParamValue(this.props.location.search, "fileType");
        this.setState({fileType});

        const lastSlash = this.props.location.pathname.lastIndexOf('/');
        const fileHash = this.props.location.pathname.substring(lastSlash + 1);
        this.setState({fileHash},
            () => {
                let unsubscribe = store.subscribe(() => {
                    this.getIpfsData(this.state.fileHash);
                });
                this.setState({unsubscribe});
                this.getIpfsData(this.state.fileHash);
                this.loadVersions();
            });
    }

    loadVersions() {
        let originalFileHash = (this.props.ipfsState.uploadedFiles
            .filter(uploadedFile => uploadedFile.fileHash === this.state.fileHash))[0].originalFileHash;
        this.setState({originalFileHash});

        let result = [];
        result = result.concat(this.props.ethState.fileHashAddedEvents
            .filter(fileEvent => fileEvent.fileHash === originalFileHash));

        result = result.concat(this.props.ethState.fileEditedEvents
            .filter(fileEvent => fileEvent.firstFileHash === originalFileHash));

        let versions = result.map((event, index) => {
            if (index === 0) {
                return {
                    fileName: event.fileName,
                    fileHash: event.fileHash
                }
            }

            return {
                fileName: event.newFileName,
                fileHash: event.newFileHash
            }
        });

        this.setState({versions});
    }

    getIpfsData = async (fileHash) => {
        let foundFileHash = this.props.ipfsState.uploadedFiles
            .filter(uploadedFile => uploadedFile.fileHash === fileHash);

        if (foundFileHash.length > 0) {
            this.setState({foundFileInstance: foundFileHash[0]});
        }
    };

    onVersionChange = (event) => {
        let selectedOption = event.target.value;
        if (selectedOption !== "") {
            let selectionArray = selectedOption.split("-");
            if (selectionArray[0] !== this.state.fileHash) {
                let fileType = selectionArray[2].substring(selectionArray[2].lastIndexOf(".") + 1);
                window.location.assign("#/uploaded-files/" +
                    this.state.foundFileInstance.originalFileHash +
                    "/version/" +
                    selectionArray[0] +
                    "?selectionIndex=" + selectionArray[1] +
                    "&fileType=" + fileType +
                    "&size=" + this.state.versions.length +
                    "&latestHash=" + this.state.fileHash +
                    "&latestValid=" + this.state.foundFileInstance.isValid);
            }
        }
    };

    render() {
        let dataToDisplay = getFilePreview(this.state.fileType,
            this.state.foundFileInstance.isValid,
            this.state.foundFileInstance.fileHash,
            this.state.foundFileInstance.partialDataToDisplay);

        return (
            <div className="info-page-main-div">
                <h3>
                    Info about <a href={ipfsPath + this.state.fileHash}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Click to open the link in IPFS">{this.state.foundFileInstance.fileHash}</a>
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
                <div className="file-versions-div">
                    <span>File versions:</span>
                    <select className="version-select custom-select"
                            defaultValue={this.state.fileHash}
                            onChange={(event) => this.onVersionChange(event)}>
                        <option value="">Choose a version to inspect</option>
                        {
                            this.state.versions.map((version, index) => (
                                <option key={index}
                                        value={(version.fileHash + "-" + index + "-" + version.fileName)}>
                                    {
                                        version.fileHash === this.state.fileHash ?
                                            "(current) "
                                            :
                                            ""
                                    }
                                    {
                                        version.fileHash === this.state.originalFileHash ?
                                            "(original) "
                                            :
                                            ""
                                    }
                                    {version.fileHash} - {version.fileName}
                                </option>
                            ))
                        }
                    </select>
                </div>
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
                                    <LinkPanel link={link}
                                               fileHash={this.state.foundFileInstance.fileHash}/>
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
        ethState: state.ethState,
        ipfsState: state.ipfsState
    }
};

export default connect(mapStateToProps, null)(SmartFileInformationPage);
