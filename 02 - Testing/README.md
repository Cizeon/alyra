This is a simple unit tests using Truffle and Chai for Alyra's sample Voting contract.

Requested by [Alyra](https://alyra.fr/) for first project request of the Rinkeby promotion.

# Notes

- Testing script is in [test/test.js](https://github.com/Cizeon/alyra/blob/main/02%20-%20Testing/test/test.js)

For the previous course, I used Hardhat.
This time is used Truffle to match the requirements.

# Testing

```console
$ truffle test
Using network 'development'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.


  Contract: Voting
    ✔ should set the correct owner
    ✔ should not allow to tally votes before end of the voting session (183ms)
    ✔ should not allow to end votes before it started
    ✔ should not allow to start votes before end of proposal phase
    ✔ should not allow to end proposals before it started
    ✔ should test voter registration emit the proper event
    ✔ should not add a voter twice
    ✔ should check that only the owner can add voters
    ✔ should check only voters can call getVoter()
    ✔ should properly register a voter
    ✔ should check proposals registration phase
    ✔ should check that only owners can start the proposal phase
    ✔ should emit the proper event when starting the proposal phase
    ✔ should check that only voters can submit a proposal
    ✔ should add a new proposal with the proper event
    ✔ should not add an empty proposal
    ✔ should emit the proper event when stopping the proposal phase
    ✔ should block votes before voting phase
    ✔ should emit the proper event when starting the voting phase
    ✔ should block votes from not allowed addresses
    ✔ should emit the proper event when voting
    ✔ should emit the proper event when stoping the voting phase
    ✔ should check that onlyOwner can tally votes
    ✔ should emit the proper event when tally votes
    ✔ should return to good winner


  25 passing (737ms)
```
