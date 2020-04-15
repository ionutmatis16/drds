import React from "react";

const MyNavbar = ({currentAccount, username}) => (
    <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0">
            <span
                onClick={() => window.location.assign("/")}
                className="navbar-brand col-sm-3 col-md-2 mr-0">
                DRDS
            </span>
            <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    {
                        currentAccount !== '' ?
                            <span className="text-white">
                                {
                                    username !== null ?
                                        <span>
                                            <strong>Username: </strong>{username}
                                        </span>
                                        :
                                        ""
                                }
                                <strong> Account address: </strong>{currentAccount}
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