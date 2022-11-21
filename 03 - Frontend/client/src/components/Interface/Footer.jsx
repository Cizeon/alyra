import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

function Footer() {
  return (
    <Box sx={{ flexGrow: 1, marginTop: 4 }}>
      <Box>Cizeon © 2022</Box>
      <Box>
        <Link underline="none" href="https://www.flaticon.com/free-icons/vote" title="vote icons">
          Vote icons created by Freepik - Flaticon
        </Link>
      </Box>
    </Box>
  );
}

export default Footer;
