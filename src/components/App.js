import React, {Component} from 'react';
import {connect} from 'react-redux';
import {HashRouter, Route, Switch} from "react-router-dom";

import "./App.css";

import DRDS from "../abis/DRDS";
import Web3 from "web3";

import MyNavbar from "./dumb/MyNavbar";
import MetamaskNotInstalled from "./dumb/MetamaskNotInstalled";
import ConnectToMetamask from "./dumb/ConnectToMetamask";

import Homepage from "./smart/SmartHomepage";
import SmartFileInformationPage from "./smart/SmartFileInformationPage";
import SmartFileLinkPage from "./smart/SmartFileLinkPage";
import {getPartialData, ipfs} from "./util/IPFSUtil";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            metamaskStatus: null,
            loadedFiles: false
        }
    }

    async componentWillMount() {
        // TODO: move this outside component & create a button to connect to metamask, as they state in their documentation
        await this.loadWeb3();
        if (this.state.metamaskStatus === "connected") {
            await this.loadBlockchainData();
            window.ethereum.on('accountsChanged', async () => {
                window.location.reload();
            });
            window.ethereum.on('chainChanged', async () => {
                window.location.reload();
            });
            window.ethereum.on('networkChanged', async () => {
                window.location.reload();
            });
        }
    }

    async loadWeb3() {
        // check for ethereum provider injected by Metamask -> modern version
        if (window.ethereum) {
            window.ethereum.autoRefreshOnNetworkChange = false;
            window.web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.enable();
                console.log("App connected to Metamask!");
                this.setState({metamaskStatus: "connected"});
            } catch (error) {
                alert("User denied access to Metamask!");
                this.setState({metamaskStatus: "denied"});
            }
        } else {
            // check for ethereum provider injected by Metamask -> old version
            if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
                this.setState({metamaskStatus: "connected"});
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
                this.setState({metamaskStatus: "not-installed"});
            }
        }
    };

    async loadBlockchainData() {
        const web3 = window.web3; // was assigned on component mount
        const accounts = await web3.eth.getAccounts(); // gets the accounts from Metamask wallet
        this.props.onAccountAddressChange(accounts[0]);
        const networkId = await web3.eth.net.getId();
        const networkData = DRDS.networks[networkId];
        if (networkData) {
            const abi = DRDS.abi;
            const smartContractAddress = networkData.address;
            const contract = new web3.eth.Contract(abi, smartContractAddress);
            this.props.onContractChange(contract);
            this.getUploadedFiles();
            this.loadEventsFromContract();
        } else {
            alert("Smart contract not deployed to detected network!");
        }
    }

    getUploadedFiles = () => {
        this.props.ethState.contract.methods
            .getUploadedFiles()
            .call({from: this.props.ethState.accountAddress})
            .then(uploadedFiles => {
                this.getLatestVersionOfUploadedFiles(uploadedFiles)
                    .then((finalVersions) => {
                        this.props.onLoadedUploadedFilesFromEth(finalVersions);
                        this.validateIpfsFiles();
                        this.setState({loadedFiles: true});
                    });
            })
            .catch(error => console.log(error));
    };

    getLatestVersionOfUploadedFiles = async (uploadedFiles) => {
        let finalVersions = [];
        for (let i = 0; i < uploadedFiles.length; i++) {
            await this.props.ethState.contract.methods
                .getLatestVersionOfFile(uploadedFiles[i].fileHash)
                .call({from: this.props.ethState.accountAddress})
                .then(result => {
                    let additionalInfo = {
                        ...result,
                        originalFileHash: uploadedFiles[i].fileHash
                    };
                    finalVersions.push(additionalInfo)
                })
                .catch(err => alert(err));
        }

        return finalVersions;
    };

    validateIpfsFiles = async () => {
        let uploadedFiles = this.props.ipfsState.uploadedFiles.concat([]);
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
                            partialDataToDisplay = "INVALID FILE";
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
                if (e.message.includes("block in storage has different hash than requested")) {
                    isValid = false;
                } else if (e.message === "Failed to fetch") {
                    alert("You are not connected to an IPFS node!");
                } else {
                    console.log(e);
                }
            }

            let partialData = "INVALID FILE";
            if (isValid) {
                partialData = await getPartialData(uploadedFiles[i].fileHash, 2000);
            }

            let updatedFile = {
                ...uploadedFiles[i],
                totalSize: totalSize,
                isValid: isValid,
                links: linkResult,
                partialDataToDisplay: partialData
            };
            this.props.onValidateLink(updatedFile);
        }
    };

    loadEventsFromContract = () => {
        this.props.ethState.contract.events
            .FileHashAdded({
                filter: {userAddress: this.props.ethState.accountAddress},
                fromBlock: 0
            }, (error, eventResult) => {
                if (error) {
                    console.log('Error in FileHashAdded event handler: ' + error);
                } else {
                    this.resolveFileHashAddedEvent(eventResult);
                }
            });
        this.props.ethState.contract.events
            .FileEdited({
                filter: {userAddress: this.props.ethState.accountAddress},
                fromBlock: 0
            }, (error, eventResult) => {
                if (error) {
                    console.log('Error in FileEdited event handler: ' + error);
                } else {
                    this.resolveFileEditedEvent(eventResult);
                }
            });
    };


    resolveFileHashAddedEvent = (eventResult) => {
        let fileHashAddedEvent = {
            contractAddress: eventResult.address,
            blockHash: eventResult.blockHash,
            blockNumber: eventResult.blockNumber,
            fileHash: eventResult.returnValues.fileHash,
            authorAddress: eventResult.returnValues.userAddress,
            transactionHash: eventResult.transactionHash,
            transactionIndex: eventResult.transactionIndex,
            eventType: eventResult.event,
            showModal: false
        };

        let events = this.props.ethState.fileHashAddedEvents.concat([fileHashAddedEvent]);
        this.props.onFileHashAddedEvents(events);
    };

    resolveFileEditedEvent = (eventResult) => {
        let fileEditedEvent = {
            contractAddress: eventResult.address,
            blockHash: eventResult.blockHash,
            blockNumber: eventResult.blockNumber,
            firstFileHash: eventResult.returnValues.firstFileHash,
            newFileName: eventResult.returnValues.newFileName,
            newFileHash: eventResult.returnValues.newFileHash,
            authorAddress: eventResult.returnValues.userAddress,
            transactionHash: eventResult.transactionHash,
            transactionIndex: eventResult.transactionIndex,
            eventType: eventResult.event,
            showModal: false
        };

        let events = this.props.ethState.fileEditedEvents.concat([fileEditedEvent]);
        this.props.onFileEditedEvents(events);
    };

    render() {
        let componentToRender;

        switch (this.state.metamaskStatus) {
            case "not-installed":
                componentToRender = <MetamaskNotInstalled/>;
                break;
            case "connected":
                if (this.state.loadedFiles === true) {
                    componentToRender = <HashRouter>
                        <Switch>
                            <Route exact component={Homepage} path="/"/>
                            <Route exact component={SmartFileInformationPage} path="/uploaded-files/:fileHash"/>
                            <Route exact component={SmartFileLinkPage} path="/uploaded-files/:fileHash/file-link/:linkHash"/>
                        </Switch>
                    </HashRouter>;
                }
                break;
            default:
                componentToRender = <ConnectToMetamask/>;
        }

        return (
            <div className="App">
                <MyNavbar accountAddress={this.props.ethState.accountAddress}
                          username={this.props.ethState.username}/>
                {
                    componentToRender
                }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        ethState: state.ethState,
        ipfsState: state.ipfsState
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAccountAddressChange: (value) => dispatch({type: "ACCOUNT_ADDRESS_CHANGE", value: value}),
        onContractChange: (value) => dispatch({type: "CONTRACT_CHANGE", value: value}),
        onLoadedUploadedFilesFromEth: (uploadedFiles) => dispatch({type: "LOADED_FROM_ETH", value: uploadedFiles}),
        onValidateLink: (updatedFiles) => dispatch({type: "VALIDATED_LINK", value: updatedFiles}),
        onFileHashAddedEvents: (events) => dispatch({type: "LOADED_ADDED_EVENTS", value: events}),
        onFileEditedEvents: (events) => dispatch({type: "LOADED_EDITED_EVENTS", value: events})
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
