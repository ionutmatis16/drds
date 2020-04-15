import React, {Component} from 'react';
import DRDS from "../../abis/DRDS";
import Web3 from "web3";
import MetamaskNotInstalled from "../dumb/MetamaskNotInstalled";
import UploadedFilesPanel from "../dumb/UploadedFilesPanel";
import MyNavbar from "../dumb/MyNavbar";
import RequestUsername from "../dumb/RequestUsername";
import UploadFileForm from "../dumb/UploadFileForm";

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('http://localhost:5001');

class Homepage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contract: null,
            currentAccount: '',
            buffer: null,
            ipfsHash: null,
            fileName: null,
            username: null,
            usernameHolder: '',
            chooseFileDisabled: true,
            uploadedFiles: []
        };
    }

    async componentWillMount() {
        // TODO: move this outside component & create a button to connect to metamask, as they state in their documentation
        await this.loadWeb3();
        if (this.state.connectedToMetamask) {
            await this.loadBlockchainData();
        }
        window.ethereum.on('accountsChanged', async () => {
            await this.loadBlockchainData();
        });
        window.ethereum.on('chainChanged', async () => {
            await this.loadBlockchainData();
        });
        this.setState({chooseFileDisabled: false})
    }

    async loadBlockchainData() {
        const web3 = window.web3; // was assigned on component mount
        const accounts = await web3.eth.getAccounts(); // gets the accounts from Metamask wallet
        this.setState({currentAccount: accounts[0]});
        const networkId = await web3.eth.net.getId();
        const networkData = DRDS.networks[networkId];
        if (networkData) {
            const abi = DRDS.abi;
            const smartContractAddress = networkData.address;
            const contract = new web3.eth.Contract(abi, smartContractAddress);
            this.setState({contract});
            this.state.contract.methods.getUsername().call({from: this.state.currentAccount})
                .then(username => username === '' ? this.setState({username: null}) : this.setState({username}))
                .catch(error => alert("Cannot load username!"));
            this.loadFileInfoFromContract();
        } else {
            alert("Smart contract not deployed to detected network!");
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
                this.setState({connectedToMetamask: true});
            } catch (error) {
                console.log("User denied access to Metamask!");
                this.setState({connectedToMetamask: "denied"});
            }
        } else {
            // check for ethereum provider injected by Metamask -> old version
            if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
                this.setState({connectedToMetamask: true});
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
                this.setState({connectedToMetamask: false});
            }
        }
    };

    captureFile = (event) => {
        event.preventDefault();
        if (event.target.files[0] !== undefined) {
            const uploadedFile = event.target.files[0];
            const fileName = event.target.files[0].name;
            const reader = new window.FileReader(); // to convert into buffer to be put on IPFS
            reader.readAsArrayBuffer(uploadedFile);
            reader.onloadend = () => {
                this.setState({
                    buffer: Buffer(reader.result),
                    fileName: fileName
                })
            }
        } else {
            this.setState({buffer: null, fileName: null});
        }
    };

    onSubmit = async (event) => {
        event.preventDefault();
        let fileHash;
        for await (const file of ipfs.add(this.state.buffer)) {
            fileHash = file.path;
        }
        console.log("Hash of the uploaded file: " + fileHash);
        this.state.contract.methods.addFileHash(this.state.fileName, fileHash, this.state.username).send({from: this.state.currentAccount})
            .then((receipt) => {
                this.setState({ipfsHash: fileHash});
                this.loadFileInfoFromContract();
            }).catch((error) => {
            console.log(error);
            if (error.message.includes("User denied transaction signature")) {
                console.log("User denied");
            } else {
                console.log("There was an error during the transaction. Assure that you have enough ETH.");
                alert("The file was already uploaded!");
            }
        });
    };

    usernameChange = (event) => {
        let usernameHolder = event.target.value;
        this.setState({usernameHolder});
    };

    saveUsername = (event) => {
        event.preventDefault();
        this.state.contract.methods.addUsername(this.state.usernameHolder).send({from: this.state.currentAccount})
            .then(receipt => {
                this.setState({username: this.state.usernameHolder});
            })
            .catch(error => alert(error));
    };

    loadFileInfoFromContract = () => {
        this.state.contract.methods.getUploadedFiles().call({from: this.state.currentAccount})
            .then(uploadedFiles => this.setState({uploadedFiles}))
            .catch(error => console.log(error));
    };

    render() {
        return (
            <div>
                {
                    this.state.connectedToMetamask === false ?
                        <MetamaskNotInstalled/>
                        :
                        <div>
                            <MyNavbar currentAccount={this.state.currentAccount}
                                      username={this.state.username}/>
                            <div id="main-panel-div">
                                <h1>Data Reliability using Decentralized Systems</h1>
                                <br/>
                            </div>
                            <div>
                                {
                                    this.state.username === null ?
                                        <RequestUsername usernameHolder={this.state.usernameHolder}
                                                         saveUsername={this.saveUsername}
                                                         usernameChange={this.usernameChange}/>
                                        :
                                        <div className="files-div">
                                            <UploadFileForm
                                                chooseFileDisabled={this.state.chooseFileDisabled}
                                                captureFile={this.captureFile}
                                                onSubmit={this.onSubmit}
                                                buffer={this.state.buffer}/>
                                            <UploadedFilesPanel uploadedFiles={this.state.uploadedFiles}/>
                                        </div>
                                }
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default Homepage;
