import { useContext } from 'react';
import VotingContext from './VotingContext';

const useVoting = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a UserProvider');
  }

  return context;
};

export default useVoting;
