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
            fileHashAddedEvents: []
        };
    }

    componentDidMount() {
        this.loadEventsFromContract();
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

    loadEventsFromContract = () => {
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
        let newFileHashAddedEvents = this.state.fileHashAddedEvents.map((fileEvent) => {
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
                        <UploadedFilesPanel uploadedFiles={this.props.ipfsState.uploadedFiles}
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

export default connect(mapStateToProps, null)(SmartHomepage);
