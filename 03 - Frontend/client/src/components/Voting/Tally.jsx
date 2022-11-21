import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import useEth from '../../contexts/EthContext/useEth';

let Tally = () => {
  const [winningProposal, setWinningPropostal] = useState('');
  const {
    state: { contract, accounts },
  } = useEth();

  /**
   * Fetch the winning proposal id.
   */
  useEffect(() => {
    (async () => {
      if (contract) {
        const winningProposalID = await contract.methods
          .winningProposalID()
          .call({ from: accounts[0] });
        const proposal = await contract.methods
          .getOneProposal(winningProposalID)
          .call({ from: accounts[0] });
        setWinningPropostal(proposal.description);
      }
    })();
  }, [accounts, contract, setWinningPropostal]);

  return (
    <Box>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        Vote have been tallied!
      </Typography>
      <Typography variant="h5" align="left" color="textSecondary" paragraph>
        The winning proposal is
      </Typography>
      <Typography variant="h2" align="center" color="textSecondary" paragraph>
        {winningProposal}
      </Typography>
    </Box>
  );
};

export default Tally;
