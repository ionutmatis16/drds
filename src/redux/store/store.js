import { createStore, combineReducers } from "redux";
import ethReducer from "../reducers/ethReducer";
import ipfsReducer from "../reducers/ipfsReducer";

const rootReducer = combineReducers({
    ethState: ethReducer,
    ipfsState: ipfsReducer
});

const store = createStore(rootReducer);

export default store;