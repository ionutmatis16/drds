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
            ipfsHash: null,
            fileName: null,
            uploadedFiles: [],
            fileHashAddedEvents: []
        };
    }

    componentDidMount() {
        this.loadFileInfoFromContract();
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
                .addFileHash(this.state.fileName, fileHash, this.props.ethState.username)
                .send({from: this.props.ethState.accountAddress})
                .then((receipt) => {
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

    loadFileInfoFromContract = () => {
        this.props.ethState.contract.methods
            .getUploadedFiles()
            .call({from: this.props.ethState.accountAddress})
            .then(uploadedFiles => {
                this.setState({uploadedFiles});
                this.validateIpfsFiles();
            })
            .catch(error => console.log(error));
        this.props.ethState.contract.events
            .FileHashAdded({
                filter: {userAddress: this.props.ethState.accountAddress},
                fromBlock: 0
            }, (error, eventResult) => {
                if (error) {
                    console.log('Error in myEvent event handler: ' + error);
                } else {
                    this.addTransactionInfoToFile(eventResult);
                }
            });
    };

    validateIpfsFiles = async () => {
        let uploadedFiles = this.state.uploadedFiles;
        let result = [];
        for (let i = 0; i < uploadedFiles.length; i++) {
            let isValid = undefined;
            try {
                await ipfs.files.stat("/ipfs/" + uploadedFiles[i].fileHash);
                isValid = true;
            } catch (error) {
                if (error.message.includes("block in storage has different hash than requested")) {
                    isValid = false;
                }
            }

            let updatedFile = {
                ...uploadedFiles[i],
                isValid: isValid
            };
            result.push(updatedFile);
        }
        this.setState({uploadedFiles: result});
    };

    addTransactionInfoToFile = (eventResult) => {
        let fileHashAddedEvent = {
            contractAddress: eventResult.address,
            blockHash: eventResult.blockHash,
            blockNumber: eventResult.blockNumber,
            fileHash: eventResult.returnValues.fileHash,
            authorAddress: eventResult.returnValues.userAddress,
            transactionHash: eventResult.transactionHash,
            transactionIndex: eventResult.transactionIndex,
            showModal: false
        };

        let events = this.state.fileHashAddedEvents.concat([fileHashAddedEvent]);
        this.setState({fileHashAddedEvents: events});
    };

    toggleModalState = (transactionHash, value) => {
        let newFileHashAddedEvents = this.state.fileHashAddedEvents.map((fileEvent, index) => {
            if (fileEvent.transactionHash !== transactionHash) {
                return fileEvent;
            }

            return {
                ...fileEvent,
                showModal: value
            }
        });
        this.setState({fileHashAddedEvents: newFileHashAddedEvents});
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
                        <UploadedFilesPanel uploadedFiles={this.state.uploadedFiles}
                                            fileHashAddedEvents={this.state.fileHashAddedEvents}
                                            toggleModalState={this.toggleModalState}/>
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

const mapDispatchToProps = dispatch => {
    return {
        onFileUpload: (fileHash) => dispatch({type: "FILE_UPLOADED", value: fileHash})
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SmartHomepage);
