import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

const ValidFileIcon = ({id}) => (
    <span>
        <FontAwesomeIcon data-for={id}
                         data-tip="The file is valid" className="ipfs-marking ipfs-check"
                         icon={faCheckCircle}/>
            <ReactTooltip id={id}
                          className="opacity-1"
                          textColor="white"
                          backgroundColor="#08f500"
                          effect="solid"/>
    </span>
);

export default ValidFileIcon;