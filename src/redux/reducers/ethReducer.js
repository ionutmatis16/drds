const initialState = {
    contract: null,
    accountAddress: '',
    fileHashAddedEvents: [],
    fileEditedEvents: []
};

function changeEthState(state, property, value) {
    return {
        ...state,
        [property]: value
    }
}

function ethReducer(state = initialState, action) {
    switch (action.type) {
        case "ACCOUNT_ADDRESS_CHANGE":
            return changeEthState(state, "accountAddress", action.value);
        case "CONTRACT_CHANGE":
            return changeEthState(state, "contract", action.value);
        case "LOADED_ADDED_EVENTS":
            return changeEthState(state, "fileHashAddedEvents", action.value);
        case "LOADED_EDITED_EVENTS":
            return changeEthState(state, "fileEditedEvents", action.value);
        default :
            return state;
    }
}

export default ethReducer;