# Unit tests for contract "Voting"

This is a simple unit tests using Truffle and Chai for Alyra's sample Voting contract.

Requested by [Alyra](https://alyra.fr/) for second project request of the Rinkeby promotion.

# Notes

- My testing script is located in [test/test.js](https://github.com/Cizeon/alyra/blob/main/02%20-%20Testing/test/test.js)

For the previous course, I used Hardhat. This time is used Truffle to match with the training.
Code coverage is not supported since the solidity-coverage plugin is now only working with Hardhat.

I used the eth-gas-reporter plugin to compute costs.

The script is testing 31 cases divided in these categories:

- Ownership
- Registration state
- Proposal state
- Voting state
- Tally state

# Testing

```
$ truffle test
Using network 'development'.


Compiling your contracts...
===========================
> Compiling ./contracts/Voting.sol
> Artifacts written to /var/folders/dx/klncq4mn26ncyy1g5tsdlkq80000gn/T/test--72879-D5negp5JtKLv
> Compiled successfully using:
   - solc: 0.8.13+commit.abaa5c0e.Emscripten.clang

  Contract: Voting
    Testing ownership
      ✓ sets the correct owner (5ms)
      ✓ forbids transfer ownership if not owner (POV hacker) (114ms)
    Testing registration state
      ✓ forbids anyone from adding voters (POV hacker) (7ms)
      ✓ should test voter registration to emit the proper event (13ms, 50220 gas)
      ✓ should properly register a voter (POV voter1) (18ms, 50220 gas)
      ✓ block adding a voter twice (20ms, 50220 gas)
      ✓ should check only voters can call getVoter() (POV hacker) (18ms, 50220 gas)
    Testing proposal state
      ✓ forbids adding a proposal before proposal phase (POV voter1) (7ms)
      ✓ forbids anyone from starting proposal phase (POV hacker) (8ms)
      ✓ should emit the proper event when starting the proposal phase (70ms, 94840 gas)
      ✓ should check that only voters can submit a proposal (POV hacker) (20ms, 94840 gas)
      ✓ should add a new proposal with the proper event (POV voter1) (34ms, 153928 gas)
      ✓ should not add an empty proposal (POV voter1) (19ms, 94840 gas)
      ✓ returns the correct proposal by id (POV voter1) (29ms, 153928 gas)
      ✓ forbids non voter to access a proposal (POV hacker) (38ms, 153928 gas)
      ✓ should emit the proper event when stopping the proposal phase (29ms, 125439 gas)
    Testing voting state
      ✓ blocks votes before voting phase (POV voter1) (10ms)
      ✓ emits the proper event when starting the voting phase (13ms, 30554 gas)
      ✓ blocks votes from not allowed addresses (POV hacker) (17ms, 30554 gas)
      ✓ emits the proper event when voting (POV voter1) (25ms, 108567 gas)
      ✓ upgrade vote count on vote (POV voter1) (29ms, 108567 gas)
      ✓ blocks voting twice (POV voter1) (30ms, 108567 gas)
      ✓ blocks voting for an unknown proposal (14ms, 30554 gas)
      ✓ should emit the proper event when stoping the voting phase (20ms, 61087 gas)
    Testing tally state
      ✓ blocks starting the proposal phase (5ms)
      ✓ blocks ending the proposal phase (6ms)
      ✓ blocks starting voting session a second time (4ms)
      ✓ blocks tally votes before voting session is over (5ms)
      ✓ should check that onlyOwner can tally votes (POV hacker) (15ms, 30533 gas)
      ✓ should emit the proper event when tally votes (31ms, 94098 gas)
      ✓ sets to proper winner (28ms, 94098 gas)

·------------------------------------------|----------------------------|-------------|----------------------------·
|   Solc version: 0.8.13+commit.abaa5c0e   ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
···········································|····························|·············|·····························
|  Methods                                                                                                         │
·············|·····························|··············|·············|·············|··············|··············
|  Contract  ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls     ·  eur (avg)  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addProposal                ·           -  ·          -  ·      59088  ·          28  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addVoter                   ·           -  ·          -  ·      50220  ·          58  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30599  ·          18  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endVotingSession           ·           -  ·          -  ·      30533  ·           6  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  setVote                    ·       60913  ·      78013  ·      70176  ·          24  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      94840  ·          25  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startVotingSession         ·           -  ·          -  ·      30554  ·          17  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  tallyVotes                 ·           -  ·          -  ·      63565  ·           3  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Deployments                             ·                                          ·  % of limit  ·             │
···········································|··············|·············|·············|··············|··············
|  Voting                                  ·           -  ·          -  ·    1970027  ·      29.3 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·

  31 passing (16s)
```
