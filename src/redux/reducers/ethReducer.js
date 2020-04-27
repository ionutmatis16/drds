const initialState = {
    contract: null,
    accountAddress: ''
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
        default :
            return state;
    }
}

export default ethReducer;