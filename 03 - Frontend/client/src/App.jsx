import Container from '@mui/material/Container';
import * as React from 'react';
import './App.css';

import { EthProvider } from './contexts/EthContext';
import { UiProvider } from './contexts/UiContext';
import { VotingProvider } from './contexts/VotingContext';

import Footer from './components/Interface/Footer';
import Header from './components/Interface/Header';
import Index from './pages/Index';

function App() {
  return (
    <UiProvider>
      <EthProvider>
        <VotingProvider>
          <div id="App">
            <Container maxWidth="md">
              <Header />
              <Index />
              <Footer />
            </Container>
          </div>
        </VotingProvider>
      </EthProvider>
    </UiProvider>
  );
}

export default App;
