This is a simple Voting contract.

Requested by [Alyra](https://alyra.fr/) for first project request of the Rinkeby promotion.

# Notes

- Contract code is in [contracts/Voling.sol](https://github.com/Cizeon/alyra/blob/c2b3802cca2907863e35ea0b51a8c8c0e61389c8/01%20-%20Voting/contracts/Voting.sol)
- Testing script is in [test/index.ts](https://github.com/Cizeon/alyra/blob/c2b3802cca2907863e35ea0b51a8c8c0e61389c8/01%20-%20Voting/test/index.ts)

Contract compiles and can be deployed on Remix.

I used Hardhat to manage unit tests. As Truffle will be teached on class, I deviced to go with Hardhat to expand my toolbox.

Global contract structure was given by Alyra and I chose to add some code
to support when more than one proposal gets the same amount of votes.

I added supports for tips, for fun and to experiment receiving ETH.

# Compile

```console
$ hh compile
Generating typings for: 3 artifacts in dir: typechain-types for target: ethers-v5
Successfully generated 16 typings!
Compiled 3 Solidity files successfully
```

# Testing

```console
$ hh test

  Voting Contract
    Ownership
      ✓ correct owner set.
    Whitelisting
      ✓ register an address and emit the VoterRegistered event.
      ✓ unregister an address and emit the VoterUnegistered event.
      ✓ only owners can register an addresses.
      ✓ verify if a user is registered.
    Starting new vote
      ✓ create a new vote with the WorkflowStatusChange event.
    Proposing
      ✓ creating a new proposal.
      ✓ no duplicate proposal.
      ✓ only authorized addresses can submit proposal.
      ✓ cannot start vote if no proposal.
    Voting
      ✓ cannot vote before voting round.
      ✓ authorized addresses can vote.
      ✓ addresses cannot vote twice.
      ✓ end voting phase.
    Voting results
      ✓ compute votes and fix correct winner.
    Voting results with arbitrage
      ✓ compute votes and fix correct winner.
      ✓ cannot arbitrage before attempting to tally first.
      ✓ contract owner cannot choose a looser proposal.
      ✓ contract owner chooses a winner proposal.
      ✓ can retrieve the winner proposal description.
      ✓ can reset the whole vote.
    Tips
      ✓ receive tips.
      ✓ withdraw tips.

·----------------------------------|---------------------------|--------------|-----------------------------·
|       Solc version: 0.8.17       ·  Optimizer enabled: true  ·  Runs: 1000  ·  Block limit: 30000000 gas  │
···································|···························|··············|······························
|  Methods                                                                                                  │
·············|·····················|·············|·············|··············|···············|··············
|  Contract  ·  Method             ·  Min        ·  Max        ·  Avg         ·  # calls      ·  usd (avg)  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  addProposal        ·      61107  ·      74869  ·       67529  ·           36  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  castVote           ·          -  ·          -  ·       79446  ·            4  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  createVote         ·          -  ·          -  ·       98962  ·           17  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  register           ·      47387  ·      47399  ·       47396  ·           47  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  reset              ·          -  ·          -  ·       61716  ·            2  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  startVotingPhase   ·          -  ·          -  ·       28523  ·           10  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  stopProposalPhase  ·          -  ·          -  ·       30662  ·           11  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  stopVotingPhase    ·          -  ·          -  ·       28546  ·            9  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  tallyVotes         ·      84909  ·     107955  ·       89518  ·           10  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  unregister         ·          -  ·          -  ·       27483  ·            2  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  voteFor            ·      40142  ·      77154  ·       58986  ·           34  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Voting    ·  withdrawTips       ·          -  ·          -  ·       31657  ·            2  ·          -  │
·············|·····················|·············|·············|··············|···············|··············
|  Deployments                     ·                                          ·  % of limit   ·             │
···································|·············|·············|··············|···············|··············
|  Voting                          ·          -  ·          -  ·     1831792  ·        6.1 %  ·          -  │
·----------------------------------|-------------|-------------|--------------|---------------|-------------·
```

# Deploy

```console
$ hh run scripts/deploy.ts
[+] Deployer balance: 10000000000000000000000
Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
[+] Deployer balance: 9999994673387500000000
```
