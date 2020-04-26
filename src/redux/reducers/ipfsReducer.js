const initialState = {
    uploadedFiles: []
};

function ipfsReducer(state = initialState, action) {
    switch (action.type) {
        case "LOADED_FROM_ETH":
            return {
                uploadedFiles: action.value
            };
        case "VALIDATED_LINKS":
            return {
                uploadedFiles: action.value
            };
        default:
            return state;
    }
}

export default ipfsReducer;