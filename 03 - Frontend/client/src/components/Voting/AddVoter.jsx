import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

import useEth from '../../contexts/EthContext/useEth';
import { useUi } from '../../contexts/UiContext';

/**
 * Attempt to add a new voter on the block chain.
 */
let AddVoter = () => {
  const [voters, setVoters] = useState([]);
  const addressRef = useRef();
  const {
    state: { contract, accounts },
  } = useEth();
  const { setMessage } = useUi();

  /**
   * Add a new voter. Display an error if it failed.
   */
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setMessage({
        content: `Trying to add a new voter: ${addressRef.current.value}.`,
        severity: 'info',
      });

      let tx = await contract.methods
        .addVoter(addressRef.current.value)
        .send({ from: accounts[0] });

      // Logging the request on the console for evidence.
      console.log(tx);

      // Success.
      setMessage({
        content: `New voter added: ${addressRef.current.value}.`,
        severity: 'success',
      });
    } catch (error) {
      setMessage({
        content: error.message,
        severity: 'error',
      });
    }
    addressRef.current.value = '';
  };

  /**
   * Retrieve the previous voters addresses.
   */
  useEffect(() => {
    (async () => {
      if (!contract) return;
      let oldEvents = await contract.getPastEvents('VoterRegistered', {
        fromBlock: 0,
        toBlock: 'latest',
      });

      let oldVoters = [];
      oldEvents.forEach((event) => {
        oldVoters.push(event.returnValues.voterAddress);
      });
      setVoters(() => oldVoters);

      await contract.events
        .VoterRegistered({ fromBlock: 'earliest' })
        .on('data', (event) => {
          setVoters((prevVoters) => [...prevVoters, event.returnValues.voterAddress]);
        })
        .on('changed', (changed) => console.log(changed))
        .on('error', (error) => console.log(error))
        .on('conntected', (str) => console.log(str));
    })();
  }, [contract]);

  return (
    <Box>
      <Box component="form" sx={{ display: 'flex' }} onSubmit={onSubmit}>
        <TextField
          inputRef={addressRef}
          sx={{ flexGrow: 1, marginRight: 2 }}
          label="Add a new voter's address here."
          id="outlined-start-adornment"
        />
        <Button type="submit" variant="outlined">
          Add
        </Button>
      </Box>

      {/* Display voters. */}
      {voters.length > 0 ? (
        <Box>
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Already Registered voters
          </Typography>

          <List>
            {voters.map((voter) => (
              <ListItem key={voter} disablePadding>
                <ListItemIcon>
                  <AlternateEmailIcon />
                </ListItemIcon>
                <ListItemText primary={voter} />
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            No voters registered yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddVoter;
