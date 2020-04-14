import React, {Component} from 'react';
import Web3 from 'web3';
import './App.css';
import DRDS from '../abis/DRDS';
import MetamaskNotInstalled from "./MetamaskNotInstalled";
import MainPanel from "./MainPanel";

// TODO: Check for account change in Metamask & reload the page?
// TODO: make the user input a username before continuing & associate it to the address in Smart Contract
const ipfsClient = require('ipfs-http-client');

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://localhost:5001');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contract: null,
            currentAccount: '',
            buffer: null,
            ipfsHash: null,
            username: null,
            usernameHolder: ''
        };
    }

    async componentWillMount() {
        // TODO: move this outside component & create a button to connect to metamask, as they state in their documentation
        await this.loadWeb3();
        if (this.state.connectedToMetamask) {
            await this.loadBlockchainData();
        }
        window.ethereum.on('accountsChanged', async (accounts) => {
            await this.loadBlockchainData();
        });
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
                .then(username => {
                    if (username === '') {
                        this.setState({username: null});
                    } else {
                        this.setState({username});
                    }
                })
                .catch(error => alert("Cannot load username!"));
        } else {
            // TODO detect the change from metamask?
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
        const uploadedFile = event.target.files[0];
        const reader = new window.FileReader(); // to convert into buffer to be put on IPFS
        reader.readAsArrayBuffer(uploadedFile);
        reader.onloadend = () => {
            this.setState({
                buffer: Buffer(reader.result)
                // ar trebui sa salvez numele fisierului undeva,
                // ca apoi ala sa poata fi afisat impreuna cu hash-ul (ca un link) pe frontend
            })
        }
    };

    onSubmit = async (event) => {
        event.preventDefault();
        let fileHash;
        for await (const file of ipfs.add(this.state.buffer)) {
            fileHash = file.path;
        }
        console.log("Hash of the uploaded file: " + fileHash);
        this.state.contract.methods.addFileHash(fileHash, this.state.username).send({from: this.state.currentAccount})
            .then((receipt) => {
                this.setState({ipfsHash: fileHash})
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
                            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                            <span
                                className="navbar-brand col-sm-3 col-md-2 mr-0">
                                DRDS
                            </span>
                                <ul className="navbar-nav px-3">
                                    <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                                        {
                                            this.state.currentAccount !== '' ?
                                                <span className="text-white">
                                                    {
                                                        this.state.username !== null ?
                                                            <span>
                                                                <strong>Username: </strong>{this.state.username}
                                                            </span>
                                                            :
                                                            ""
                                                    }
                                                    <strong> Account address: </strong>{this.state.currentAccount}
                                                </span>
                                                :
                                                ""
                                        }
                                    </li>
                                </ul>
                            </nav>
                            <div className="container-fluid mt-5">
                                <div className="row">
                                    <main role="main" className="col-lg-12 d-flex text-center">
                                        <div className="content mr-auto ml-auto">
                                            {
                                                this.state.username === null ?
                                                    <div>
                                                        <br/>
                                                        <h1>Before continuing, please provide a username</h1>
                                                        <h3>This will be saved together with your account address</h3>
                                                        <br/>
                                                        <form onSubmit={this.saveUsername}>
                                                            <span id="username-label">Username: </span>
                                                            <input type="text" onChange={this.usernameChange}/>
                                                            <input type="submit"
                                                                   disabled={this.state.usernameHolder === ''}/>
                                                        </form>
                                                    </div>
                                                    :
                                                    <MainPanel buffer={this.state.buffer}
                                                               onSubmit={this.onSubmit}
                                                               ipfsHash={this.state.ipfsHash}
                                                               captureFile={this.captureFile}/>
                                            }
                                        </div>
                                    </main>
                                </div>
                            </div>

                        </div>
                }
            </div>
        );
    }
}

export default App;
