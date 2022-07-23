const actions = {
  init: "INIT",
};

const initialState = {
  artifact: null,
  artifacts: [],
  web3: null,
  accounts: null,
  networkID: null,
  contract: null
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      console.log(data.contract.methods);
      return { ...state, ...data, artifacts: [...state.artifacts, data.artifact] };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer
};
