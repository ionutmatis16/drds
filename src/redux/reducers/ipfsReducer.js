const resetFileState = {
    fileHash: '',
    isValid: undefined,
    links: [],
    totalSize: 0,
    partialDataToDisplay: ''
};

const initialState = {
    uploadedFiles: [],
    selectedVersionFile: resetFileState,
    originalVersion: resetFileState
};

function changeIpfsState(state, property, value) {
    return {
        ...state,
        [property]: value
    }
}

function ipfsReducer(state = initialState, action) {
    switch (action.type) {
        case "LOADED_FROM_ETH":
            return {
                ...state,
                uploadedFiles: action.value
            };
        case "VALIDATED_LINK":
            let result = state.uploadedFiles
                .map(updatedFile => {
                    if (updatedFile.fileHash !== action.value.fileHash) {
                        return updatedFile;
                    }
                    return {
                        ...updatedFile,
                        totalSize: action.value.totalSize,
                        isValid: action.value.isValid,
                        links: action.value.links,
                        partialDataToDisplay: action.value.partialDataToDisplay
                    }
                });
            return {
                ...state,
                uploadedFiles: result
            };
        case "VERSION_FILE_CHANGED":
            return changeIpfsState(state, "selectedVersionFile", action.value);
        case "VERSION_FILE_RESET":
            return changeIpfsState(state, "selectedVersionFile", resetFileState);
        default:
            return state;
    }
}

export default ipfsReducer;