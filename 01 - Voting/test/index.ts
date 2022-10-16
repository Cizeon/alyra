import { expect } from 'chai';
import { Contract } from 'ethers';
import hre from 'hardhat';

describe('Voting Contract', () => {
  let votingContract: Contract;
  let owner: any;
  let account1: any;
  let account2: any;
  let account3: any;
  let account4: any;

  beforeEach(async () => {
    const votingContractFactory = await hre.ethers.getContractFactory('Voting');
    votingContract = await votingContractFactory.deploy();
    await votingContract.deployed();
    [owner, account1, account2, account3, account4] = await hre.ethers.getSigners();
  });

  describe('Ownership', async () => {
    it('correct owner set.', async () => {
      let contractOwner = await votingContract.owner();
      expect(contractOwner).to.be.equal(owner.address);
    });
  });

  describe('Whitelisting', async () => {
    it('register an address and emit the VoterRegistered event.', async () => {
      await expect(votingContract.register(account1.address)).to.emit(
        votingContract,
        'VoterRegistered',
      );
    });
    it('unregister an address and emit the VoterUnegistered event.', async () => {
      await expect(votingContract.unregister(account1.address)).to.emit(
        votingContract,
        'VoterUnregistered',
      );
    });
    it('only owners can register an addresses.', async () => {
      await expect(votingContract.connect(account1).register(account2.address)).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });
    it('verify if a user is registered.', async () => {
      await votingContract.register(account1.address);
      const b = await votingContract.isRegistered(account1.address);
      expect(b).to.be.true;
    });
  });

  describe('Starting new vote', async () => {
    it('create a new vote with the WorkflowStatusChange event.', async () => {
      await expect(votingContract.createVote('What is the best blockchain school?')).to.emit(
        votingContract,
        'WorkflowStatusChange',
      );
    });
  });

  describe('Proposing', async () => {
    beforeEach(async () => {
      await votingContract.register(account1.address);
      await votingContract.createVote('What is the best blockchain school?');
    });

    it('creating a new proposal.', async () => {
      await expect(votingContract.connect(account1).addProposal('Alyra')).to.emit(
        votingContract,
        'ProposalRegistered',
      );
    });

    it('no duplicate proposal.', async () => {
      await votingContract.connect(account1).addProposal('Alyra');
      await expect(votingContract.connect(account1).addProposal('Alyra')).be.revertedWith(
        'proposal already submitted',
      );
    });

    it('only authorized addresses can submit proposal.', async () => {
      await expect(votingContract.connect(account2).addProposal('RuggSchool')).be.revertedWith(
        'you are not allowed',
      );
    });

    it('cannot start vote if no proposal.', async () => {
      await expect(votingContract.stopProposalPhase()).to.be.revertedWith('no proposals');
    });
  });

  describe('Voting', async () => {
    beforeEach(async () => {
      await votingContract.register(account1.address);
      await votingContract.register(account2.address);
      await votingContract.register(account3.address);
      await votingContract.createVote('What is the best blockchain school?');
      await votingContract.connect(account1).addProposal('Alyra');
      await votingContract.connect(account2).addProposal('RuggSchool');
      await votingContract.connect(account3).addProposal('PayToPassSchool');
      await votingContract.stopProposalPhase();
    });

    it('cannot vote before voting round.', async () => {
      await expect(votingContract.connect(account1).voteFor(0)).to.be.rejectedWith('wrong state');
    });

    it('authorized addresses can vote.', async () => {
      await votingContract.startVotingPhase();
      await expect(votingContract.connect(account1).voteFor(0)).to.emit(votingContract, 'Voted');
      await expect(votingContract.connect(account4).voteFor(0)).to.be.revertedWith(
        'you are not allowed',
      );
    });

    it('addresses cannot vote twice.', async () => {
      await votingContract.startVotingPhase();
      await expect(votingContract.connect(account1).voteFor(0)).to.emit(votingContract, 'Voted');
      await expect(votingContract.connect(account1).voteFor(0)).to.be.revertedWith('already voted');
    });

    it('end voting phase.', async () => {
      await votingContract.startVotingPhase();
      await expect(votingContract.connect(account1).voteFor(0)).to.emit(votingContract, 'Voted');
      await expect(votingContract.stopVotingPhase()).to.emit(
        votingContract,
        'WorkflowStatusChange',
      );
    });
  });

  describe('Voting results', async () => {
    beforeEach(async () => {
      await votingContract.register(account1.address);
      await votingContract.register(account2.address);
      await votingContract.register(account3.address);
      await votingContract.register(account4.address);
      await votingContract.createVote('What is the best blockchain school?');
      await votingContract.connect(account2).addProposal('RuggSchool');
      await votingContract.connect(account1).addProposal('Alyra');
      await votingContract.connect(account3).addProposal('PayToPassSchool');
      await votingContract.stopProposalPhase();
      await votingContract.startVotingPhase();
      await votingContract.connect(account1).voteFor(0);
      await votingContract.connect(account2).voteFor(1);
      await votingContract.connect(account3).voteFor(1);
      await votingContract.connect(account4).voteFor(1);
      await votingContract.stopVotingPhase();
    });

    it('compute votes and fix correct winner.', async () => {
      await expect(votingContract.tallyVotes()).to.emit(votingContract, 'WorkflowStatusChange');
      let res = await votingContract.getWinners();
      expect(Number(res[0])).to.be.equal(1);
      res = await votingContract.getWinner();
      expect(Number(res)).to.be.equal(1);
    });
  });

  describe('Voting results with arbitrage', async () => {
    beforeEach(async () => {
      await votingContract.register(account1.address);
      await votingContract.register(account2.address);
      await votingContract.register(account3.address);
      await votingContract.register(account4.address);
      await votingContract.createVote('What is the best blockchain school?');
      await votingContract.connect(account2).addProposal('RuggSchool');
      await votingContract.connect(account3).addProposal('PayToPassSchool');
      await votingContract.connect(account1).addProposal('Alyra');
      await votingContract.stopProposalPhase();
      await votingContract.startVotingPhase();
      await votingContract.connect(account1).voteFor(0);
      await votingContract.connect(account2).voteFor(2);
      await votingContract.connect(account3).voteFor(2);
      await votingContract.connect(account4).voteFor(0);
      await votingContract.stopVotingPhase();
    });

    it('compute votes and fix correct winner.', async () => {
      await expect(votingContract.tallyVotes()).to.emit(votingContract, 'Draw');
    });

    it('cannot arbitrage before attempting to tally first.', async () => {
      await expect(votingContract.castVote(0)).to.be.revertedWith('tally first');
    });

    it('contract owner cannot choose a looser proposal.', async () => {
      await expect(votingContract.tallyVotes()).to.emit(votingContract, 'Draw');
      await expect(votingContract.castVote(3)).to.be.revertedWith('wrong proposal id');
    });

    it('contract owner chooses a winner proposal.', async () => {
      await expect(votingContract.tallyVotes()).to.emit(votingContract, 'Draw');
      let res = await votingContract.getWinners();
      await expect(votingContract.castVote(2)).to.emit(votingContract, 'WorkflowStatusChange');
      res = await votingContract.getWinners();
      expect(Number(res)).to.be.equal(2);
      res = await votingContract.getWinner();
      expect(Number(res)).to.be.equal(2);
    });

    it('can retrieve the winner proposal description.', async () => {
      await expect(votingContract.tallyVotes()).to.emit(votingContract, 'Draw');
      let res = await votingContract.getWinners();
      await expect(votingContract.castVote(2)).to.emit(votingContract, 'WorkflowStatusChange');
      res = await votingContract.getWinnerDescription();
      expect(res).to.be.equal('Alyra');
    });

    it('can reset the whole vote.', async () => {
      await expect(votingContract.reset()).to.emit(votingContract, 'WorkflowStatusChange');
    });
  });

  describe('Tips', async () => {
    it('receive tips.', async () => {
      const tx = await account1.sendTransaction({
        to: votingContract.address,
        value: hre.ethers.utils.parseEther('1.0'),
      });
      await tx.wait();
      let balance = await hre.ethers.provider.getBalance(votingContract.address);
      expect(balance).to.be.equals(hre.ethers.utils.parseEther('1.0'));
    });

    it('withdraw tips.', async () => {
      const tx = await account1.sendTransaction({
        to: votingContract.address,
        value: hre.ethers.utils.parseEther('1.0'),
      });
      await tx.wait();
      let balance = await hre.ethers.provider.getBalance(votingContract.address);
      expect(balance).to.be.equals(hre.ethers.utils.parseEther('1.0'));

      await expect(votingContract.withdrawTips()).to.emit(votingContract, 'TipWithdrawn');
      balance = await hre.ethers.provider.getBalance(votingContract.address);
      expect(balance).to.be.equals(0);
    });
  });
});
