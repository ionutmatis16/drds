const initialState = {
    // TODO: keep this on localStorage?
    uploadedFilesTxInfo: []
};

function changeIFPSState(state, property, value) {
    return {
        ...state,
        [property]: value
    }
}

function ipfsReducer(state = initialState, action) {
    return state;
}

export default ipfsReducer;