import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';

import useEth from '../../contexts/EthContext/useEth';
import { useUi } from '../../contexts/UiContext';

import { actions, useVoting, WorkflowStatus } from '../../contexts/VotingContext';

let Proposals = () => {
  const proposalRef = useRef();
  const { state, dispatch } = useVoting();
  const {
    state: { contract, accounts },
  } = useEth();
  const { setMessage } = useUi();
  /**
   * Add a new proposal. Display an error if it failed.
   */
  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setMessage({
        content: `Trying to submit a new proposal: ${proposalRef.current.value}.`,
        severity: 'info',
      });

      let tx = await contract.methods
        .addProposal(proposalRef.current.value)
        .send({ from: accounts[0] });

      // Logging the request on the console for evidence.
      console.log(tx);

      // Success.
      setMessage({
        content: `New proporal added: ${proposalRef.current.value}.`,
        severity: 'success',
      });
    } catch (error) {
      /* TODO: Parse the error message to display a friendly error. */
      setMessage({
        content: error.message,
        severity: 'error',
      });
    }
    proposalRef.current.value = '';
  };

  /**
   * Vote on chain.
   */
  const handleVote = async (proposalId) => {
    try {
      setMessage({
        content: `Voting...`,
        severity: 'info',
      });

      let tx = await contract.methods.setVote(proposalId).send({ from: accounts[0] });

      // Logging the request on the console for evidence.
      console.log(tx);

      // Success.
      setMessage({
        content: `Voted!`,
        severity: 'success',
      });

      dispatch({ type: actions.SET_HAS_VOTED, data: true });
    } catch (error) {
      /* TODO: Parse the error message to display a friendly error. */
      setMessage({
        content: error.message,
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      {state.workflowStatus === WorkflowStatus.ProposalsRegistrationStarted && (
        <Box>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Please add your proposals:
          </Typography>
          <Box component="form" sx={{ display: 'flex' }} onSubmit={onSubmit}>
            <TextField
              inputRef={proposalRef}
              sx={{ flexGrow: 1, marginRight: 2 }}
              label="Add a new proposal here."
              id="outlined-start-adornment"
            />
            <Button type="submit" variant="outlined">
              Add
            </Button>
          </Box>
        </Box>
      )}

      {!state.hasVoted ? (
        state.proposals && state.proposals.length > 0 ? (
          <Box>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              Proposal{state.proposals.length > 1 && 's'}:
            </Typography>

            <List>
              {state.proposals.map((proposal, id) => (
                <ListItem key={proposal.id} disablePadding>
                  <ListItemIcon>
                    <QuestionAnswerIcon />
                  </ListItemIcon>
                  <ListItemText primary={proposal.description} />
                  {state.workflowStatus === WorkflowStatus.VotingSessionStarted && (
                    <Button value={proposal.id} onClick={() => handleVote(proposal.id)}>
                      Vote
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              No proposal registered yet.
            </Typography>
          </Box>
        )
      ) : (
        <Box>
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            You have voted!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Proposals;
