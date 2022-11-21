import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import useEth from '../../contexts/EthContext/useEth';

/**
 * This is the view of a non registered user.
 */
let Public = () => {
  const {
    state: { accounts },
  } = useEth();

  return (
    <Paper elevation={3} sx={{ p: 2, marginTop: 2 }}>
      <Typography variant="h5" align="left" paragraph>
        Welcome to on chain voting!
      </Typography>
      <Typography variant="h6" align="left" color="red" paragraph>
        You are not registered for voting.
      </Typography>
      <Typography variant="h6" align="left" color="textSecondary" paragraph>
        Please send your wallet address
        {accounts && accounts[0] ? ': ' + accounts[0] : ''} <br />
        if you believe you should be part of the vote.
      </Typography>

      <Typography>
        Demo: if you want to see the vote finalized, use this wallet:
        <br />
        Address: 0x210B8E2B9B15dd618d5008CDD8A8aa7e462D2Fe4
        <br />
        Mnemonic: pride unknown dentist lucky adult few catch police ride orbit mask parrot
        <br />
        PrivateKey: 0xfe5b40e80f4eca8e829fa57034d85989d818c7502f9c307c8955ba3af479de11
      </Typography>
    </Paper>
  );
};

export default Public;
