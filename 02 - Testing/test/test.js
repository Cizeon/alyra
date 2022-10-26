const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const constants = require('@openzeppelin/test-helpers/src/constants');

const Voting = artifacts.require('Voting');

contract('Voting', (accounts) => {
  let owner = accounts[0];
  let votingInstance;

  beforeEach(async () => {
    votingInstance = await Voting.deployed();
  });

  /**
   * @dev Check ownership of the contract.
   */

  describe('Owner tests', async () => {
    it('sets the correct owner', async () => {
      const contractOwner = await votingInstance.owner();
      expect(contractOwner).to.be.equal(owner);
    });

    it('forbids transfer ownership if not owner', async () => {
      await expectRevert(
        votingInstance.transferOwnership(accounts[1], { from: accounts[1] }),
        'Ownable: caller is not the owner',
      );
    });
  });

  /**
   * @dev Check that you cannot call some functions during the wrong phase.
   */

  describe('Workflow Status tests', async () => {
    it('blocks tally votes before end of the voting session', async () => {
      await expectRevert(votingInstance.tallyVotes(), 'Current status is not voting session ended');
    });

    it('blocks ending votes before it started', async () => {
      await expectRevert(votingInstance.endVotingSession(), 'Voting session havent started yet');
    });

    it('blocks starting votes before end of proposal phase', async () => {
      await expectRevert(
        votingInstance.startVotingSession(),
        'Registering proposals phase is not finished',
      );
    });

    it('blocks ending proposals before it started', async () => {
      await expectRevert(
        votingInstance.endProposalsRegistering(),
        'Registering proposals havent started yet',
      );
    });
  });

  /**
   * @dev Test the voting process.
   */

  describe('Voting process tests', async () => {
    it('should test voter registration emit the proper event', async () => {
      let result = await votingInstance.addVoter(accounts[1]);
      expectEvent(result, 'VoterRegistered', {
        voterAddress: accounts[1],
      });
    });

    it('should not add a voter twice', async () => {
      await expectRevert(votingInstance.addVoter(accounts[1]), 'Already registered');
    });

    it('should check that only the owner can add voters', async () => {
      await expectRevert(
        votingInstance.addVoter(accounts[3], { from: accounts[1] }),
        'Ownable: caller is not the owner',
      );
    });

    it('should check only voters can call getVoter()', async () => {
      await expectRevert(votingInstance.getVoter(accounts[1]), "You're not a voter");
    });

    it('should properly register a voter', async () => {
      result = await votingInstance.getVoter(accounts[1], { from: accounts[1] });
      expect(result.isRegistered).to.equal(true);

      /* Adding new voters from future tests. */
      await votingInstance.addVoter(accounts[2]);
    });

    it('should check proposals registration phase', async () => {
      await expectRevert(
        votingInstance.addProposal('proposal 1', { from: accounts[1] }),
        'Proposals are not allowed yet',
      );
    });

    it('should check that only owners can start the proposal phase', async () => {
      await expectRevert(
        votingInstance.startProposalsRegistering({ from: accounts[1] }),
        'Ownable: caller is not the owner',
      );
    });

    it('should emit the proper event when starting the proposal phase', async () => {
      const result = await votingInstance.startProposalsRegistering();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(0),
        newStatus: BN(1),
      });
    });

    it('should check that only voters can submit a proposal', async () => {
      await expectRevert(votingInstance.addProposal('proposal 1'), "You're not a voter");
    });

    it('should add a new proposal with the proper event', async () => {
      let result = await votingInstance.addProposal('proposal 1', { from: accounts[1] });
      expectEvent(result, 'ProposalRegistered', {
        proposalId: BN(1),
      });

      await votingInstance.addProposal('proposal 2', { from: accounts[2] });
    });

    it('should not add an empty proposal', async () => {
      await expectRevert(
        votingInstance.addProposal('', { from: accounts[1] }),
        'Vous ne pouvez pas ne rien proposer',
      );
    });

    it('should emit the proper event when stopping the proposal phase', async () => {
      const result = await votingInstance.endProposalsRegistering();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(1),
        newStatus: BN(2),
      });
    });

    it('should block votes before voting phase', async () => {
      await expectRevert(
        votingInstance.setVote(1, { from: accounts[1] }),
        'Voting session havent started yet',
      );
    });

    it('should emit the proper event when starting the voting phase', async () => {
      const result = await votingInstance.startVotingSession();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(2),
        newStatus: BN(3),
      });
    });

    it('should block votes from not allowed addresses', async () => {
      await expectRevert(votingInstance.setVote(1), "You're not a voter");
    });

    it('should emit the proper event when voting', async () => {
      let result = await votingInstance.setVote(1, { from: accounts[1] });
      await expectEvent(result, 'Voted', {
        voter: accounts[1],
        proposalId: BN(1),
      });

      result = await votingInstance.setVote(1, { from: accounts[2] });
      await expectEvent(result, 'Voted', {
        voter: accounts[2],
        proposalId: BN(1),
      });
    });

    it('should emit the proper event when stoping the voting phase', async () => {
      const result = await votingInstance.endVotingSession();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(3),
        newStatus: BN(4),
      });
    });

    it('should check that onlyOwner can tally votes', async () => {
      await expectRevert(
        votingInstance.tallyVotes({ from: accounts[1] }),
        'Ownable: caller is not the owner',
      );
    });

    it('should emit the proper event when tally votes', async () => {
      const result = await votingInstance.tallyVotes();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(4),
        newStatus: BN(5),
      });
    });

    it('should return to good winner', async () => {
      const winningProposalID = await votingInstance.winningProposalID();
      expect(winningProposalID).to.be.bignumber.equal(BN(1));
    });
  });
});
