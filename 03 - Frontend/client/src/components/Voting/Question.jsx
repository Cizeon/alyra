import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import useEth from '../../contexts/EthContext/useEth';

let Question = () => {
  const [question, setQuestion] = useState('loading question...');
  const {
    state: { contract, accounts },
  } = useEth();

  useEffect(() => {
    (async () => {
      if (!contract) return;

      let question = await contract.methods.question().call({ from: accounts[0] });
      setQuestion(question);
    })();
  }, [contract, accounts, setQuestion]);

  return (
    <Typography variant="h5" align="center" color="textSecondary" paragraph>
      {question}
    </Typography>
  );
};

export default Question;
