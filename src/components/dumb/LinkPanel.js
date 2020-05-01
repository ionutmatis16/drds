import React from "react";
import ValidFileIcon from "./ValidFileIcon";
import InvalidFileIcon from "./InvalidFileIcon";


const LinkPanel = ({link, fileHash, isVersion}) => (
    <div>
        <li>
            <p><strong>Link size: </strong>{link.size} bytes</p>
            <div className="p-ipfs-check">
                <p>
                    <strong>Link hash: </strong>
                    <a href={("#/uploaded-files/" + fileHash + "/file-link/" + link.hash + "?isVersion=" + isVersion)}
                       title="Click to open the link in DRDS">
                        {" " + link.hash}
                    </a>
                </p>
                {
                    link.linkIsValid ?
                        <ValidFileIcon id={link.hash}/>
                        :
                        link.linkIsValid === false ?
                            <InvalidFileIcon id={link.hash}/>
                            :
                            ""
                }
            </div>
        </li>
        <hr/>
    </div>
);

export default LinkPanel;