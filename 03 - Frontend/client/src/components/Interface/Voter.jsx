import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { useVoting, WorkflowStatus } from '../../contexts/VotingContext';

import Proposals from '../Voting/Proposals';
import Tally from '../Voting/Tally';

/**
 * This is the voter's component.
 */
let Voter = () => {
  const { state } = useVoting();

  let displayStatusSwitch = () => {
    switch (state.workflowStatus) {
      case WorkflowStatus.RegisteringVoters:
        return (
          <Typography variant="h6" align="left" component={'span'}>
            <Typography variant="h4" align="center" sx={{ marginBottom: 2 }}>
              Congratulations
            </Typography>
            <p>You have been registered to vote.</p>
            <p>Now, just wait until the proposing phase starts.</p>
          </Typography>
        );
      case WorkflowStatus.VotesTallied:
        return <Tally />;
      default:
        return <Proposals />;
    }
  };

  return (
    <Paper elevation={3} sx={{ marginTop: 2, p: 2 }}>
      {displayStatusSwitch()}
    </Paper>
  );
};

export default Voter;
