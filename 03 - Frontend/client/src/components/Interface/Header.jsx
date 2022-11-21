import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import WalletConnect from '../Web3/WalletConnect';

export default function Header() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 0, m: 0, marginTop: 2 }}>
      <Box
        component="img"
        sx={{
          height: 48,
          width: 48,
          maxHeight: { xs: 48, md: 48 },
          maxWidth: { xs: 48, md: 48 },
          padding: { xs: 1, md: 1 },
        }}
        alt="Logo"
        src="/logo512.png"
      />

      <Typography variant="h2" align="center" color="textPrimary" gutterBottom sx={{ flexGrow: 1 }}>
        Let's vote!
      </Typography>

      <Box>
        <WalletConnect />
      </Box>
    </Box>
  );
}
