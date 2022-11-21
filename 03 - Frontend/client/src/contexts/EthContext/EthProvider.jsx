import React, { useCallback, useEffect, useReducer } from 'react';
import Web3 from 'web3';

import { useUi } from '../UiContext';
import EthContext from './EthContext';
import { actions, initialState, reducer } from './state';

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setMessage } = useUi();

  const init = useCallback(
    async (artifact) => {
      let web3 = undefined;
      let accounts = undefined;
      let networkID = undefined;
      let address = undefined;
      let contract = undefined;

      /* Connecting to the wallet. */
      if (artifact) {
        try {
          web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
          accounts = await web3.eth.requestAccounts();
          networkID = await web3.eth.net.getId();
        } catch (err) {
          console.log(err);
          setMessage({
            content: 'Could not connect to your wallet. Do you have one installed?',
            severity: 'error',
          });
        }

        /* Loading the contract. */
        try {
          const { abi } = artifact;
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.log(err);
          setMessage({
            content: 'Could not reach the smart contract. Is it deployed?',
            severity: 'error',
          });
          return;
        }

        setMessage({
          content: `New wallet connected: ${accounts[0].toString()}`,
          severity: 'info',
        });

        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract },
        });
      }
    },
    [setMessage],
  );

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require('../../contracts/Voting.json');
        init(artifact);
      } catch (err) {
        setMessage({ content: 'Wallet error', severity: 'error' });
        console.error(err);
      }
    };

    tryInit();
  }, [init, setMessage]);

  useEffect(() => {
    const events = ['chainChanged', 'accountsChanged'];
    const handleChange = () => {
      try {
        init(state.artifact);
      } catch (err) {
        console.log(err);
      }
    };

    try {
      events.forEach((e) => window.ethereum.on(e, handleChange));
      return () => {
        events.forEach((e) => window.ethereum.removeListener(e, handleChange));
      };
    } catch (err) {
      console.log(err);
    }
  }, [init, state.artifact, setMessage]);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
