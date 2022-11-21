import DoneIcon from '@mui/icons-material/Done';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';

import useEth from '../../contexts/EthContext/useEth';

let WalletConnect = () => {
  let displayReducedAddress = (address) => {
    address = address.substring(2).toUpperCase();
    address = '0x' + address.slice(0, 6) + ' ... ' + address.slice(-6);
    return address;
  };

  let {
    state: { accounts },
  } = useEth();

  return (
    <Box>
      {accounts && (
        <Button
          color="primary"
          variant="contained"
          endIcon={<DoneIcon />}
          style={{ textTransform: 'none' }}
        >
          {displayReducedAddress(accounts[0].toString())}
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect;
