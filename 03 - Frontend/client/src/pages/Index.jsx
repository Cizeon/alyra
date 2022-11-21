import Box from '@mui/material/Box';

import { useVoting } from '../contexts/VotingContext';

import Admin from '../components/Interface/Admin';
import Message from '../components/Interface/Message';
import Public from '../components/Interface/Public';
import Voter from '../components/Interface/Voter';
import Progress from '../components/Voting/Progress';
import Question from '../components/Voting/Question';

let Index = () => {
  const { state } = useVoting();

  return (
    <Box sx={{ flexGrow: 1, m: 1 }}>
      <Box sx={{ minHeigth: '2em' }}>
        <Message />
      </Box>

      {(state.isAdmin || state.isVoter) && (
        <Box>
          <Box sx={{ flexGrow: 1, m: 6 }}>
            <Question />
          </Box>

          <Box sx={{ flexGrow: 1, m: 3 }}>
            <Progress />
          </Box>
        </Box>
      )}

      {state.isAdmin && <Admin />}
      {/* The admin could also allow him to vote, it is not exclusive. */}
      {state.isVoter && <Voter />}
      {/* If we are not the admin nor a voter, display the public page. */}
      {!(state.isAdmin || state.isVoter) && <Public />}
    </Box>
  );
};

export default Index;
