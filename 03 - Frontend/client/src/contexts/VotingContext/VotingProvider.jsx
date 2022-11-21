import { useCallback, useEffect, useReducer } from 'react';

import { useEth } from '../EthContext';
import { useUi } from '../UiContext';
import { actions, initialState, reducer } from './state';
import VotingContext from './VotingContext';

const VotingProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { setMessage } = useUi();
  const {
    state: { contract, accounts },
  } = useEth();

  /**
   * Check if we are the contact's owner. If so, toggle the admin component.
   */
  useEffect(() => {
    (async () => {
      if (!contract) return;

      let owner = await contract.methods.owner().call({ from: accounts[0] });
      if (owner === accounts[0]) {
        dispatch({ type: actions.SET_ADMIN, data: true });
      } else {
        dispatch({ type: actions.SET_ADMIN, data: false });
      }
    })();
  }, [contract, accounts]);

  /**
   * Check if we are a voter. We could be both the owner and a voter.
   * Switch the view if so.
   */
  useEffect(() => {
    (async () => {
      if (!contract) return;

      try {
        /* Are we allowed to vote? */
        let voter = await contract.methods.getVoter(accounts[0]).call({ from: accounts[0] });
        if (voter.isRegistered === true) {
          dispatch({ type: actions.SET_VOTER, data: true });
        } else {
          dispatch({ type: actions.SET_VOTER, data: false });
        }
      } catch (error) {
        dispatch({ type: actions.SET_VOTER, data: false });
      }

      await contract.events
        .VoterRegistered({ fromBlock: 'earliest' })
        .on('data', (event) => {
          if (event.returnValues.voterAddress === accounts[0]) {
            dispatch({ type: actions.SET_VOTER, data: true });
          }
        })
        .on('changed', (changed) => console.log(changed))
        .on('error', (error) => console.log(error))
        .on('conntected', (str) => console.log(str));
    })();
  }, [contract, accounts, dispatch]);

  /**
   * Set the currentStatus to the current value from the smart contract.
   */
  useEffect(() => {
    (async () => {
      if (!contract) return;
      let currentStatus = await contract.methods.workflowStatus().call({ from: accounts[0] });
      dispatch({ type: actions.CHANGE_STATUS, data: Number(currentStatus) });
    })();
  }, [contract, accounts, dispatch]);

  /**
   * Monitor for status change and update the state.
   */
  useEffect(() => {
    (async () => {
      if (!contract) return;
      await contract.events
        .WorkflowStatusChange({ fromBlock: 'earliest' })
        .on('data', (event) => {
          const newStatus = Number(event.returnValues.newStatus);
          if (newStatus) {
            dispatch({ type: actions.CHANGE_STATUS, data: newStatus });
            // Success.
            setMessage({
              content: `New voting state: ${state.labels[newStatus]}.`,
              severity: 'success',
            });
          }
        })
        .on('changed', (changed) => console.log(changed))
        .on('error', (error) => console.log(error))
        .on('conntected', (str) => console.log(str));
    })();
  }, [contract, state, setMessage]);

  /**
   * Retrieve the previous proposals and add them to the reducer.
   */
  const fetchProposal = useCallback(async () => {
    if (!contract) return;

    let oldEvents = await contract.getPastEvents('ProposalRegistered', {
      fromBlock: 0,
      toBlock: 'latest',
    });

    dispatch({
      type: actions.SET_PROPOSALS,
      data: [],
    });
    await oldEvents.forEach(async (event) => {
      const proposalId = event.returnValues.proposalId;
      const proposal = await contract.methods
        .getOneProposal(proposalId)
        .call({ from: accounts[0] });

      dispatch({
        type: actions.ADD_PROPOSAL,
        data: {
          id: proposalId,
          description: proposal.description,
          voteCount: proposal.voteCount,
        },
      });
    });

    await contract.events
      .ProposalRegistered({ fromBlock: 'earliest' })
      .on('data', async (event) => {
        const proposalId = event.returnValues.proposalId;
        const proposal = await contract.methods
          .getOneProposal(proposalId)
          .call({ from: accounts[0] });

        dispatch({
          type: actions.ADD_PROPOSAL,
          data: {
            id: proposalId,
            description: proposal.description,
            voteCount: proposal.voteCount,
          },
        });
      })
      .on('changed', (changed) => console.log(changed))
      .on('error', (error) => console.log(error))
      .on('conntected', (str) => console.log(str));
  }, [contract, accounts, dispatch]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  return (
    <VotingContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {props.children}
    </VotingContext.Provider>
  );
};

export default VotingProvider;
