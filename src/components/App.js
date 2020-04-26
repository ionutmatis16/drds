import React, {Component} from 'react';
import {connect} from 'react-redux';
import {HashRouter, Route, Switch} from "react-router-dom";

import "./App.css";

import DRDS from "../abis/DRDS";
import Web3 from "web3";

import MyNavbar from "./dumb/MyNavbar";
import MetamaskNotInstalled from "./dumb/MetamaskNotInstalled";
import ConnectToMetamask from "./dumb/ConnectToMetamask";
import RequestUsername from "./dumb/RequestUsername";

import Homepage from "./smart/SmartHomepage";
import SmartFileInformationPage from "./smart/SmartFileInformationPage";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            metamaskStatus: null,
            requestedUsername: ''
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
        // TODO: add here the file uploads & validations so that it can be used throughout the app
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
            this.props.ethState.contract.methods
                .getUsername()
                .call({from: this.props.ethState.accountAddress})
                .then(username => this.props.onUsernameChange(username))
                .catch(error => {
                    alert("Cannot load username! Make sure the contract is deployed!");
                    console.log(error);
                });
        } else {
            alert("Smart contract not deployed to detected network!");
        }
    }

    requestedUsernameChange = (event) => {
        let requestedUsername = event.target.value;
        this.setState({requestedUsername: requestedUsername});
    };

    saveRequestedUsername = (event) => {
        event.preventDefault();
        this.props.ethState.contract.methods
            .addUsername(this.state.requestedUsername.trim())
            .send({from: this.props.ethState.accountAddress})
            .then(() => this.props.onRequestedUsernameSave(this.state.requestedUsername.trim()))
            .catch(error => alert(error));
    };

    render() {
        let componentToRender;

        switch (this.state.metamaskStatus) {
            case "not-installed":
                componentToRender = <MetamaskNotInstalled/>;
                break;
            case "connected":
                if (this.props.ethState.username === '') {
                    componentToRender = <RequestUsername requestedUsername={this.state.requestedUsername}
                                                         requestedUsernameChange={this.requestedUsernameChange}
                                                         saveRequestedUsername={this.saveRequestedUsername}/>;
                } else {
                    componentToRender = <HashRouter>
                        <Switch>
                            <Route exact component={Homepage} path="/"/>
                            <Route exact component={SmartFileInformationPage} path="/uploaded-files/:fileHash"/>
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
        ethState: state.ethState
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAccountAddressChange: (value) => dispatch({type: "ACCOUNT_ADDRESS_CHANGE", value: value}),
        onContractChange: (value) => dispatch({type: "CONTRACT_CHANGE", value: value}),
        onRequestedUsernameSave: (value) => dispatch({type: "REQUESTED_USERNAME_SAVE", value: value}),
        onUsernameChange: (value) => dispatch({type: "USERNAME_CHANGE", value: value})
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
