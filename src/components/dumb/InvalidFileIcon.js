import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

const InvalidFileIcon = ({id}) => (
    <span>
        <FontAwesomeIcon data-for={id}
                         data-tip="The file is corrupted"
                         className="ipfs-marking ipfs-cross" icon={faTimes}/>
        <ReactTooltip id={id}
                      className="opacity-1"
                      textColor="white"
                      backgroundColor="red"
                      effect="solid"/>
    </span>
);

export default InvalidFileIcon;