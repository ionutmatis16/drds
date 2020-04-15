import React from 'react';
import './App.css';
import {HashRouter, Switch, Route} from "react-router-dom";
import Homepage from "./smart/Homepage";
import FileInformationPage from "./smart/FileInformationPage";

const App = () => (
    <div className="App">
        <HashRouter>
            <Switch>
                <Route exact component={Homepage} path="/"/>
                <Route exact component={FileInformationPage} path="/uploaded-files/:fileHash"/>
            </Switch>
        </HashRouter>
    </div>
);

export default App;
