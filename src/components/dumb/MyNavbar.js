import React from "react";

const MyNavbar = ({accountAddress, username}) => (
    <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0">
            <span
                onClick={() => window.location.assign("#/")}
                className="navbar-brand col-sm-3 col-md-2 mr-0">
                DRDS
                <span className="home-nav-link">Home</span>
            </span>
            <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    {
                        accountAddress !== '' ?
                            <span className="text-white">
                                {
                                    username !== '' ?
                                        <span>
                                            <strong>Username: </strong>{username}
                                        </span>
                                        :
                                        ""
                                }
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