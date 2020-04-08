import React, {Component} from 'react';
import Web3 from 'web3';
import './App.css';
import DRDS from '../abis/DRDS';

// TODO: Check for account change in Metamask & reload the page?
// TODO: make the user input a username before continuing & associate it to the address in Smart Contract
const ipfsClient = require('ipfs-http-client');

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://localhost:5001');
const ipfsPath = "http://localhost:8080/ipfs/";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contract: null,
            currentAccount: '',
            buffer: null,
            ipfsHash: null,
            username: "Empty for now"
        };
    }

    async componentWillMount() {
        // TODO: move this outside component & create a button to connect to metamask, as they state in their documentation
        await this.loadWeb3();
        await this.loadBlockchainData();
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
            let author = await contract.methods.getAuthor("a").call();
            console.log(author);
        } else {
            // TODO detect the change from metamask?
            alert("Smart contract not deployed to detected network");
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
                this.setState({connectedToMetamask: false});
            }
        } else {
            // check for ethereum provider injected by Metamask -> old version
            if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
            } else {
                alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
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
            })
        }
    };

    onSubmit = async (event) => {
        event.preventDefault();
        let fileHash;
        for await (const file of ipfs.add(this.state.buffer)) {
            fileHash = file.path;
        }
        console.log(fileHash);
        this.state.contract.methods.addFileHash(fileHash, this.state.username).send({from: this.state.currentAccount})
            .then((receipt) => {
                this.setState({ipfsHash: fileHash})
            }).catch((error) => {
            if (error.message.includes("User denied transaction signature")) {
                console.log("User denied");
            } else {
                this.setState({ipfsHash: fileHash})
                alert("The file was already uploaded!");
            }
        });
    };

    render() {
        return (
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
                                    <small className="text-white">
                                        <strong>Account address: </strong>{this.state.currentAccount}
                                    </small>
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
                                <h1>Data Reliability using Decentralized Systems</h1>
                                <img src={(ipfsPath + this.state.ipfsHash)} alt="Ipfs hash"/>
                                <br/>
                                <br/>
                                <br/>
                                <h2>Upload a file</h2>
                                <form onSubmit={this.onSubmit}>
                                    <input type="file" onChange={this.captureFile}/>
                                    <input type="submit" disabled={this.state.buffer === null}/>
                                </form>
                                {/*<img id="metamask-icon" src={process.env.PUBLIC_URL + '/mm-logo.svg'} alt="Metamask logo"/>*/}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
