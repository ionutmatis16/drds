import React, {Component} from 'react';
import {getPartialData, ipfs} from '../util/IPFSUtil';
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
                this.props.onLoadedUploadedFilesFromEth(uploadedFiles);
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
        let uploadedFiles = this.props.ipfsState.uploadedFiles.concat([]);
        let result = [];
        for (let i = 0; i < uploadedFiles.length; i++) {
            let isValid = undefined;
            let linkResult = [];
            let totalSize = 0;
            try {
                let nodeData = await ipfs.object.get(uploadedFiles[i].fileHash);
                isValid = true;
                totalSize = nodeData.size;

                let links = [];
                nodeData._links.forEach(link => links.push({size: link.Tsize, hash: link.Hash.string}));
                for (let j = 0; j < links.length; j++) {
                    let linkIsValid = undefined;
                    let partialDataToDisplay = '';
                    try {
                        partialDataToDisplay = await getPartialData(links[j].hash, 2000);
                        linkIsValid = true;
                    } catch (e) {
                        if (e.message.includes("block in storage has different hash than requested")) {
                            linkIsValid = false;
                            isValid = false;
                        }
                    }

                    let updatedLink = {
                        ...links[j],
                        linkIsValid: linkIsValid,
                        partialDataToDisplay: partialDataToDisplay
                    };

                    linkResult.push(updatedLink);
                }
            } catch (e) {
                if (e.message === "Failed to fetch") {
                    alert("You are not connected to an IPFS node!");
                } else {
                    console.log(e);
                }
            }

            let updatedFile = {
                ...uploadedFiles[i],
                totalSize: totalSize,
                isValid: isValid,
                links: linkResult
            };
            result.push(updatedFile);
        }
        this.props.onValidateLinks(result);
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

const mapDispatchToProps = dispatch => {
    return {
        onLoadedUploadedFilesFromEth: (uploadedFiles) => dispatch({type: "LOADED_FROM_ETH", value: uploadedFiles}),
        onValidateLinks: (updatedFiles) => dispatch({type: "VALIDATED_LINKS", value: updatedFiles})
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SmartHomepage);
