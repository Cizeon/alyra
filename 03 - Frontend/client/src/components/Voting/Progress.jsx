import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import useEth from '../../contexts/EthContext/useEth';
import { useUi } from '../../contexts/UiContext';
import { useVoting, WorkflowStatus } from '../../contexts/VotingContext';

export default function Progress() {
  const { state } = useVoting();
  const { setMessage } = useUi();
  const {
    state: { contract, accounts },
  } = useEth();

  /**
   * Handle changing status.
   */
  const handleChange = async (event, value) => {
    try {
      setMessage({
        content: `Changing voting state to ${state.labels[value]}`,
        severity: 'info',
      });

      let tx;
      switch (value) {
        case WorkflowStatus.ProposalsRegistrationStarted:
          tx = await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
          break;
        case WorkflowStatus.ProposalsRegistrationEnded:
          tx = await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
          break;
        case WorkflowStatus.VotingSessionStarted:
          tx = await contract.methods.startVotingSession().send({ from: accounts[0] });
          break;
        case WorkflowStatus.VotingSessionEnded:
          tx = await contract.methods.endVotingSession().send({ from: accounts[0] });
          break;
        case WorkflowStatus.VotesTallied:
          tx = await contract.methods.tallyVotes().send({ from: accounts[0] });
          break;
        default:
          throw new Error('Invalid workflowStatus value');
      }

      // Logging the request on the console for evidence.
      console.log(tx);

      // Success.
      setMessage({
        content: `Changed state to ${state.labels[value]}.`,
        severity: 'success',
      });
    } catch (error) {
      /* TODO: Parse the error message to display a friendly error. */
      setMessage({
        content: error.message,
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ToggleButtonGroup
        color="primary"
        exclusive
        aria-label="Platform"
        value={state.workflowStatus}
        onChange={handleChange}
      >
        {state.labels.map((label, i) => {
          return (
            <ToggleButton
              key={i}
              value={i}
              style={{ maxWidth: '8em', maxHeight: '4em', minWidth: '8em', minHeight: '4em' }}
              disabled={!state.isAdmin || state.workflowStatus + 1 !== i ? true : false}
            >
              {label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}
