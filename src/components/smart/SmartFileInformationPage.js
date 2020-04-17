import React, {Component} from 'react';
import {ipfs, ipfsPath} from "../util/IPFSUtil";

export default class SmartFileInformationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileHash: '',
            totalSize: 0,
            links: []
        }
    }


    async componentDidMount() {
        const lastSlash = this.props.location.pathname.lastIndexOf('/');
        const fileHash = this.props.location.pathname.substring(lastSlash + 1);
        this.setState({fileHash});
        let nodeData = await ipfs.object.get(fileHash);
        this.setState({totalSize: nodeData.size});
        let links = nodeData._links;
        this.setState({links});
        console.log(nodeData);
    }

    render() {
        return (
            <div className="info-page-main-div">
                <h3>Info about {this.state.fileHash}</h3>
                <p>Total size: {this.state.totalSize}</p>
                <ol>
                    {
                        this.state.links.map((link, index) =>
                            <li key={index}>
                                <p>Link size: {link.Tsize}</p>
                                <p>
                                    Link hash:
                                    <a href={(ipfsPath + link.Hash.string)}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       title="Click to open the link in IPFS">
                                        {" " + link.Hash.string}
                                    </a>
                                </p>
                            </li>
                        )
                    }
                </ol>
            </div>
        )
    }
}
