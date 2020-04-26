const initialState = {
    uploadedFiles: []
};

function ipfsReducer(state = initialState, action) {
    switch (action.type) {
        case "LOADED_FROM_ETH":
            return {
                uploadedFiles: action.value
            };
        case "VALIDATED_LINK":
            let result =  state.uploadedFiles
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
                uploadedFiles: result
            };
        default:
            return state;
    }
}

export default ipfsReducer;