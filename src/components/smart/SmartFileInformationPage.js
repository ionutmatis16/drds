import React, {Component} from 'react';
import {ipfs, ipfsPath} from "../util/IPFSUtil";
import ValidFileIcon from "../dumb/ValidFileIcon";
import InvalidFileIcon from "../dumb/InvalidFileIcon";

export default class SmartFileInformationPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fileHash: '',
            totalSize: 0,
            links: [],
            fileType: '',
            isValid: undefined,
            partialDataToDisplay: ""
        }
    }

    async componentDidMount() {
        await this.resolveUrl();
    }

    async componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            await this.resolveUrl();
        }
    }

    async resolveUrl() {
        const fileType = this.getQueryParamValue(this.props, "fileType");
        this.setState({fileType});

        const lastSlash = this.props.location.pathname.lastIndexOf('/');
        const fileHash = this.props.location.pathname.substring(lastSlash + 1);
        this.setState({fileHash});

        try {
            let nodeData = await ipfs.object.get(fileHash);
            let links = [];
            nodeData._links.forEach(link => links.push({size: link.Tsize, hash: link.Hash.string}));
            this.setState({
                totalSize: nodeData.size,
                links: links,
                isValid: true
            });

            this.setState({
                partialDataToDisplay: await this.getPartialData(fileHash, 2000)
            });

            let textArea = document.getElementById("ipfs-textarea");
            if (textArea) {
                textArea.scroll(0, 0);
            }
        } catch (e) {
            if (e.message === "Failed to fetch") {
                alert("You are not connected to an IPFS node!");
            } else if (e.message.includes("block in storage has different hash than requested")) {
                this.setState({isValid: false});
            } else {
                console.log(e);
            }
        }
    }

    getQueryParamValue(props, queryParam) {
        let url = props.location.search;
        let questionMark = url.indexOf("?");
        let params = props.location.search.substring(questionMark + 1).split("&");

        for (let i = 0; i < params.length; i++) {
            let paramSplit = params[i].split("=");
            if (paramSplit[0] === queryParam) {
                return paramSplit[1];
            }
        }

        return '';
    }

    async getPartialData(ipfsHash, maxChars) {
        const chunks = [];
        for await (const chunk of ipfs.cat(ipfsHash)) {
            chunks.push(chunk)
        }

        let result = Buffer.concat(chunks).toString();
        if (maxChars < result.length) {
            result = result.substring(0, maxChars) + "...";
        }

        return result;
    };

    render() {
        let dataToDisplay = "";

        switch (this.state.fileType) {
            case "jpg":
            case "jpeg":
            case "png":
                dataToDisplay = <img className="ipfs-image"
                                     src={(ipfsPath + this.state.fileHash)}
                                     alt="IPFS object"/>;
                break;
            default :
                dataToDisplay = <div>
                    <h6>Showing the first 2000 characters of your uploaded file</h6>
                    <textarea id="ipfs-textarea"
                              value={this.state.partialDataToDisplay}
                              disabled/>
                </div>
        }

        return (
            <div className="info-page-main-div">
                <h3>
                    Info about <a href={ipfsPath + this.state.fileHash}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Click to open the link in IPFS">
                    {this.state.fileHash}
                </a>
                    {
                        this.state.isValid ?
                            <ValidFileIcon id={this.state.fileHash}/>
                            :
                            this.state.isValid === false ?
                                <InvalidFileIcon id={this.state.fileHash}/>
                                :
                                ""
                    }
                </h3>
                {
                    dataToDisplay
                }
                <p className="file-hash-p"><strong>Total size: </strong>{this.state.totalSize} bytes</p>
                <p><strong>Nr of links: </strong>{this.state.links.length}</p>
                <ol>
                    {
                        this.state.links.map((link, index) =>
                            <div key={index}>
                                <li>
                                    <p><strong>Link size: </strong>{link.size} bytes</p>
                                    <p>
                                        <strong>Link hash: </strong>
                                        <a href={("#/uploaded-files/" + link.hash)}
                                           title="Click to open the link in DRDS">
                                            {" " + link.hash}
                                        </a>
                                    </p>
                                </li>
                                <hr/>
                            </div>
                        )
                    }
                </ol>
            </div>
        )
    }
};
