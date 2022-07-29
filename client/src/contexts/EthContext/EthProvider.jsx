import React, { useCallback, useEffect, useReducer } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { actions, initialState, reducer } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async artifacts => {
      if (artifacts && artifacts.length) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:9545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();

        const { abi } = artifacts[0];
        let address, contract;
        try {
          address = artifacts[0].networks[networkID] && artifacts[0].networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
        }
        // listenToPaymentEvent();
        dispatch({
          type: actions.init,
          data: { artifact: artifacts[0], web3, accounts, networkID, contract }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifactItemManager = require("../../contracts/ItemManager.json");
        const artifactItem = require("../../contracts/Item.json");
        await Promise.all([
          init([artifactItemManager, artifactItem])
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      console.info(`handleChange`);
      init(state.artifacts);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifacts]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
