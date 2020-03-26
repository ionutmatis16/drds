import React, {Component} from 'react';
import './App.css';

// TODO: change favicon?
const ipfsClient = require('ipfs-http-client');

// connect to ipfs daemon API server
const ipfs = ipfsClient('http://localhost:5001');
const ipfsPath = "https://localhost:5001/ipfs/";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buffer: null,
            ipfsHash: null
        };
    }

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
        console.log("submitting");
        for await (const file of ipfs.add(this.state.buffer)) {
            this.setState({ipfsHash: file.path})
        }
    };

    render() {
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <span
              className="navbar-brand col-sm-3 col-md-2 mr-0">
            DRDS
          </span>
                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">
                                <h1>Data Reliability using Decentralized Systems</h1>
                                <img src={(ipfsPath + this.state.ipfsHash)} alt="Ipfs image hash"/>
                                <br/>
                                <br/>
                                <br/>
                                <h2>Upload a file</h2>
                                <form onSubmit={this.onSubmit}>
                                    <input type="file" onChange={this.captureFile}/>
                                    <input type="submit"/>
                                </form>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
