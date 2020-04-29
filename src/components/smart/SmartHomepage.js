import React, {Component} from 'react';
import {ipfs} from '../util/IPFSUtil';
import {connect} from 'react-redux';
import UploadFileForm from "../dumb/UploadFileForm";
import UploadedFilesPanel from "../dumb/UploadedFilesPanel";

class SmartHomepage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileBuffer: null,
            fileName: null,
            eventsToDisplay: []
        };
    }

    componentDidMount() {
        this.sortEvents();
    }

    captureFile = (event) => {
        event.preventDefault();
        if (event.target.files[0] !== undefined) {
            const uploadedFile = event.target.files[0];
            const fileName = event.target.files[0].name;
            const reader = new window.FileReader(); // to convert into fileBuffer to be put on IPFS
            reader.readAsArrayBuffer(uploadedFile);
            reader.onloadend = () => {
                this.setState({
                    fileBuffer: Buffer(reader.result),
                    fileName: fileName
                });
            }
        } else {
            this.setState({fileBuffer: null, fileName: null});
        }
    };

    onSubmit = async (event) => {
        event.preventDefault();
        let fileHash;
        try {
            for await (const file of ipfs.add(this.state.fileBuffer)) {
                fileHash = file.path;
            }
            console.log("Hash of the uploaded file: " + fileHash);
            this.props.ethState.contract.methods
                .addFileHash(this.state.fileName, fileHash)
                .send({from: this.props.ethState.accountAddress})
                .then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    console.log(error);
                    if (error.message.includes("User denied transaction signature")) {
                        console.log("User denied");
                    } else {
                        console.log("There was an error during the transaction. Assure that you have enough ETH.");
                        alert("The file was already uploaded!");
                    }
                });
        } catch (error) {
            alert("App might not be connected to an IPFS node");
            console.log(error);
        }
    };

    onFileEdit = async (oldFileHash) => {
        let fileEditElement = document.getElementById("file-input-edit-" + oldFileHash);
        fileEditElement.onchange = event => {
            if (event.target.files[0] !== undefined) {
                const uploadedFile = event.target.files[0];
                const fileName = event.target.files[0].name;
                const reader = new window.FileReader(); // to convert into fileBuffer to be put on IPFS
                reader.readAsArrayBuffer(uploadedFile);
                reader.onloadend = async () => {
                    let fileBuffer = Buffer(reader.result);
                    let newFileHash;
                    try {
                        for await (const file of ipfs.add(fileBuffer)) {
                            newFileHash = file.path;
                        }
                        this.props.ethState.contract.methods
                            .editFile(oldFileHash, fileName, newFileHash)
                            .send({from: this.props.ethState.accountAddress})
                            .then(() => {
                                window.location.reload();
                            })
                            .catch((error) => {
                                console.log(error);
                                if (error.message.includes("User denied transaction signature")) {
                                    console.log("User denied");
                                } else {
                                    console.log("There was an error during the transaction. Assure that you have enough ETH.");
                                    alert("The file was already uploaded!");
                                }
                            });
                    } catch (error) {
                        alert("App might not be connected to an IPFS node");
                        console.log(error);
                    }
                }
            }
        };
        fileEditElement.click();
    };

    sortEvents = () => {
        let result = [];
        let uploadedFiles = this.props.ipfsState.uploadedFiles;
        for (let i = 0; i < uploadedFiles.length; i++) {
            if (uploadedFiles[i].originalFileHash === uploadedFiles[i].fileHash) {
                // the file was not edited => search in fileHashAddedEvents
                for (let j = 0; j < this.props.ethState.fileHashAddedEvents.length; j++) {
                    if (uploadedFiles[i].fileHash === this.props.ethState.fileHashAddedEvents[j].fileHash) {
                        result.push({...this.props.ethState.fileHashAddedEvents[j]});
                    }
                }
            } else {
                // the file was edited => search in fileEditedEvents
                let lastEventForThisHash;
                for (let j = 0; j < this.props.ethState.fileEditedEvents.length; j++) {
                    if (uploadedFiles[i].originalFileHash === this.props.ethState.fileEditedEvents[j].firstFileHash) {
                        lastEventForThisHash = {...this.props.ethState.fileEditedEvents[j]};
                    }
                }
                result.push(lastEventForThisHash);
            }
        }

        this.setState({eventsToDisplay: result});
    };

    toggleModalState = (transactionHash, value) => {
        let newEvents = this.state.eventsToDisplay.map((fileEvent) => {
            if (fileEvent.transactionHash !== transactionHash) {
                return fileEvent;
            }

            return {
                ...fileEvent,
                showModal: value
            }
        });
        this.setState({eventsToDisplay: newEvents});
    };

    render() {
        return (
            <div>
                <div className="main-panel-div">
                    <h1>Data Reliability using Decentralized Systems</h1>
                    <br/>
                </div>
                <div>
                    <div className="files-div">
                        <UploadFileForm captureFile={this.captureFile}
                                        onSubmit={this.onSubmit}
                                        fileBuffer={this.state.fileBuffer}/>
                        <UploadedFilesPanel uploadedFiles={this.props.ipfsState.uploadedFiles}
                                            eventsToDisplay={this.state.eventsToDisplay}
                                            toggleModalState={this.toggleModalState}
                                            onFileEdit={this.onFileEdit}/>
                    </div>
                </div>
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

export default connect(mapStateToProps, null)(SmartHomepage);
