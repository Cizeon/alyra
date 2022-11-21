import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { useVoting, WorkflowStatus } from '../../contexts/VotingContext';

import AddVoter from '../Voting/AddVoter';

let Admin = () => {
  const { state } = useVoting();

  let displayStatusSwitch = () => {
    switch (state.workflowStatus) {
      case WorkflowStatus.RegisteringVoters:
        return <AddVoter />;
      case WorkflowStatus.VotesTallied:
        return (
          <Box>
            <Typography variant="h6">Votes have been tallied, well done!</Typography>
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h6">Switch to the next voting phase when ready.</Typography>
          </Box>
        );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ m: 2 }}>
        <Typography variant="h5">Welcome home admin!</Typography>
      </Box>

      {displayStatusSwitch()}
    </Paper>
  );
};

export default Admin;
