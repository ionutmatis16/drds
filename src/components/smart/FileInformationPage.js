import React, {Component} from 'react';

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('http://localhost:5001');

export default class FileInformationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileHash: null
        }
    }

    async componentDidMount() {
        const lastSlash = this.props.location.pathname.lastIndexOf('/');
        const fileHash = this.props.location.pathname.substring(lastSlash + 1);
        this.setState({fileHash});
        let a = await ipfs.object.get(fileHash);
        console.log(a);
    }

    render() {
        return (
            <div>

            </div>
        )
    }
}
