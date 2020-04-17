const initialState = {
    contract: null,
    accountAddress: '',
    username: '',
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
        case "REQUESTED_USERNAME_SAVE":
            return changeEthState(state, "username", action.value);
        case "USERNAME_CHANGE":
            return changeEthState(state, "username", action.value);
        default :
            return state;
    }
}

export default ethReducer;