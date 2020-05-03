import React from "react";

function validHash(fileHash) {
    return fileHash.startsWith("Qm") && fileHash.length === 46;
}

const MyNavbar = ({accountAddress, onSearchHashChange, searchHashValue}) => (
    <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0">
            <span
                onClick={() => window.location.assign("#/")}
                className="navbar-brand col-sm-3 col-md-2 mr-0">
                DRDS
                <span className="home-nav-link">Home</span>
            </span>
            <input className=
                       {
                           "form-control mr-sm-2 hash-search-input " +
                           (searchHashValue !== "" && !validHash(searchHashValue) ? "red-border" : "")
                       }
                   type="search"
                   value={searchHashValue}
                   onChange={(event) => onSearchHashChange(event)}
                   placeholder="Type your hash"
                   aria-label="Search"/>
            <button className="btn btn-success see-details-button hash-search-button"
                    type="button"
                    disabled={!validHash(searchHashValue)}
                    onClick={() => window.location.assign("#/debug-hash/" + searchHashValue)}>
                Search folder
            </button>
            <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    {
                        accountAddress !== '' ?
                            <span className="text-white">
                                <strong> Account address: </strong>{accountAddress}
                            </span>
                            :
                            ""
                    }
                </li>
            </ul>
        </nav>
    </div>
);

export default MyNavbar;