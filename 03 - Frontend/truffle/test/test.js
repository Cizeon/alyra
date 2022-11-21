const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Voting = artifacts.require('Voting');
const question = 'What is the best blockchain school?';

/**
 * @dev This is the testing script for the Voting contract.
 * Tests multiple scenarios from ownership, to normal voting process, to malicous activity.
 */

contract('Voting', (accounts) => {
  let owner = accounts[0];
  let voter1 = accounts[1];
  let voter2 = accounts[2];
  let hacker = accounts[4];
  let votingInstance;

  /**
   * @dev WorkflowStatus enum values.
   */

  const WorkflowStatus = {
    RegisteringVoters: 0,
    ProposalsRegistrationStarted: 1,
    ProposalsRegistrationEnded: 2,
    VotingSessionStarted: 3,
    VotingSessionEnded: 4,
    VotesTallied: 5,
  };

  /**
   * @dev Check ownership of the contract.
   */

  describe('Testing ownership', async () => {
    beforeEach(async () => {
      votingInstance = await Voting.new(question);
    });

    it('sets the correct owner', async () => {
      const contractOwner = await votingInstance.owner();
      expect(contractOwner).to.be.equal(owner);
    });

    it('forbids transfer ownership if not owner (POV hacker)', async () => {
      await expectRevert(
        votingInstance.transferOwnership(hacker, { from: hacker }),
        'Ownable: caller is not the owner',
      );
    });
  });

  /**
   * @dev Test registration state.
   */

  describe('Testing registration state', async () => {
    beforeEach(async () => {
      votingInstance = await Voting.new(question);
    });

    it('forbids anyone from adding voters (POV hacker)', async () => {
      await expectRevert(
        votingInstance.addVoter(hacker, { from: hacker }),
        'Ownable: caller is not the owner',
      );
    });

    it('should test voter registration to emit the proper event', async () => {
      let result = await votingInstance.addVoter(voter1);
      expectEvent(result, 'VoterRegistered', {
        voterAddress: voter1,
      });
    });

    it('should properly register a voter (POV voter1)', async () => {
      let result = await votingInstance.addVoter(voter1);
      result = await votingInstance.getVoter(voter1, { from: voter1 });
      expect(result.isRegistered).to.equal(true);
    });

    it('block adding a voter twice', async () => {
      await votingInstance.addVoter(voter1);
      await expectRevert(votingInstance.addVoter(voter1), 'Already registered');
    });

    it('should check only voters can call getVoter() (POV hacker)', async () => {
      await votingInstance.addVoter(voter1);
      await expectRevert(votingInstance.getVoter(voter1, { from: hacker }), "You're not a voter");
    });
  });

  /**
   * @dev Test the proposal state.
   */

  describe('Testing proposal state', async () => {
    beforeEach(async () => {
      votingInstance = await Voting.new(question);
      await votingInstance.addVoter(voter1);
      await votingInstance.addVoter(voter2);
    });

    it('forbids adding a proposal before proposal phase (POV voter1)', async () => {
      await expectRevert(
        votingInstance.addProposal('proposal 1', { from: voter1 }),
        'Proposals are not allowed yet',
      );
    });

    it('forbids anyone from starting proposal phase (POV hacker)', async () => {
      await expectRevert(
        votingInstance.startProposalsRegistering({ from: hacker }),
        'Ownable: caller is not the owner',
      );
    });

    it('should emit the proper event when starting the proposal phase', async () => {
      const result = await votingInstance.startProposalsRegistering();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(WorkflowStatus.RegisteringVoters),
        newStatus: BN(WorkflowStatus.ProposalsRegistrationStarted),
      });
    });

    it('should check that only voters can submit a proposal (POV hacker)', async () => {
      await votingInstance.startProposalsRegistering();
      await expectRevert(
        votingInstance.addProposal('proposal 1', { from: hacker }),
        "You're not a voter",
      );
    });

    it('should add a new proposal with the proper event (POV voter1)', async () => {
      await votingInstance.startProposalsRegistering();
      let result = await votingInstance.addProposal('proposal 1', {
        from: voter1,
      });
      expectEvent(result, 'ProposalRegistered', {
        proposalId: BN(1),
      });
    });

    it('should not add an empty proposal (POV voter1)', async () => {
      await votingInstance.startProposalsRegistering();
      await expectRevert(
        votingInstance.addProposal('', { from: voter1 }),
        'Vous ne pouvez pas ne rien proposer',
      );
    });

    it('returns the correct proposal by id (POV voter1)', async () => {
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal('proposal 1', { from: voter1 });
      let result = await votingInstance.getOneProposal(1, { from: voter1 });
      expect(result.description).to.be.equal('proposal 1');
    });

    it('forbids non voter to access a proposal (POV hacker)', async () => {
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal('proposal 1', { from: voter1 });
      await expectRevert(votingInstance.getOneProposal(1, { from: hacker }), "You're not a voter");
    });

    it('should emit the proper event when stopping the proposal phase', async () => {
      await votingInstance.startProposalsRegistering();
      const result = await votingInstance.endProposalsRegistering();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(WorkflowStatus.ProposalsRegistrationStarted),
        newStatus: BN(WorkflowStatus.ProposalsRegistrationEnded),
      });
    });
  });

  /**
   * @dev Test the voting state.
   */

  describe('Testing voting state', async () => {
    beforeEach(async () => {
      votingInstance = await Voting.new(question);
      await votingInstance.addVoter(voter1);
      await votingInstance.addVoter(voter2);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal('proposal 1', { from: voter1 });
      await votingInstance.endProposalsRegistering();
    });

    it('blocks votes before voting phase (POV voter1)', async () => {
      await expectRevert(
        votingInstance.setVote(1, { from: voter1 }),
        'Voting session havent started yet',
      );
    });

    it('emits the proper event when starting the voting phase', async () => {
      const result = await votingInstance.startVotingSession();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(WorkflowStatus.ProposalsRegistrationEnded),
        newStatus: BN(WorkflowStatus.VotingSessionStarted),
      });
    });

    it('blocks votes from not allowed addresses (POV hacker)', async () => {
      await votingInstance.startVotingSession();
      await expectRevert(votingInstance.setVote(1, { from: hacker }), "You're not a voter");
    });

    it('emits the proper event when voting (POV voter1)', async () => {
      await votingInstance.startVotingSession();

      let result = await votingInstance.setVote(1, { from: voter1 });
      await expectEvent(result, 'Voted', {
        voter: voter1,
        proposalId: BN(1),
      });
    });

    it('upgrade vote count on vote (POV voter1)', async () => {
      await votingInstance.startVotingSession();
      let currentVoteCount = (await votingInstance.getOneProposal(1, { from: voter1 })).voteCount;
      await votingInstance.setVote(1, { from: voter1 });
      let newVoteCount = (await votingInstance.getOneProposal(1, { from: voter1 })).voteCount;
      expect(newVoteCount).to.be.bignumber.equal(BN(currentVoteCount + 1));
    });

    it('blocks voting twice (POV voter1)', async () => {
      await votingInstance.startVotingSession();
      await votingInstance.setVote(1, { from: voter1 });
      await expectRevert(votingInstance.setVote(1, { from: voter1 }), 'You have already voted');
    });

    it('blocks voting for an unknown proposal', async () => {
      await votingInstance.startVotingSession();
      await expectRevert(votingInstance.setVote(2, { from: voter1 }), 'Proposal not found');
    });

    it('should emit the proper event when stoping the voting phase', async () => {
      await votingInstance.startVotingSession();
      const result = await votingInstance.endVotingSession();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(WorkflowStatus.VotingSessionStarted),
        newStatus: BN(WorkflowStatus.VotingSessionEnded),
      });
    });
  });

  /**
   * @dev Testing tally state.
   */

  describe('Testing tally state', async () => {
    beforeEach(async () => {
      votingInstance = await Voting.new(question);
      await votingInstance.addVoter(voter1);
      await votingInstance.addVoter(voter2);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal('proposal 1', { from: voter1 });
      await votingInstance.addProposal('proposal 2', { from: voter2 });
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.setVote(1, { from: voter1 });
      await votingInstance.setVote(1, { from: voter2 });
    });

    it('blocks starting the proposal phase', async () => {
      await expectRevert(
        votingInstance.startProposalsRegistering(),
        'Registering proposals cant be started now',
      );
    });

    it('blocks ending the proposal phase', async () => {
      await expectRevert(
        votingInstance.endProposalsRegistering(),
        'Registering proposals havent started yet',
      );
    });

    it('blocks starting voting session a second time', async () => {
      await expectRevert(
        votingInstance.startVotingSession(),
        'Registering proposals phase is not finished',
      );
    });

    it('blocks tally votes before voting session is over', async () => {
      await expectRevert(votingInstance.tallyVotes(), 'Current status is not voting session ended');
    });

    it('should check that onlyOwner can tally votes (POV hacker)', async () => {
      await votingInstance.endVotingSession();
      await expectRevert(
        votingInstance.tallyVotes({ from: hacker }),
        'Ownable: caller is not the owner',
      );
    });

    it('should emit the proper event when tally votes', async () => {
      await votingInstance.endVotingSession();
      const result = await votingInstance.tallyVotes();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(WorkflowStatus.VotingSessionEnded),
        newStatus: BN(WorkflowStatus.VotesTallied),
      });
    });

    it('sets to proper winner', async () => {
      await votingInstance.endVotingSession();
      const result = await votingInstance.tallyVotes();
      const winningProposalID = await votingInstance.winningProposalID();
      expect(winningProposalID).to.be.bignumber.equal(BN(1));
    });
  });

  /**
   * @dev Testing tally with DOS conditions.
   */

  describe('Testing DOS adding proposals', async () => {
    beforeEach(async () => {
      votingInstance = await Voting.new(question);
      await votingInstance.addVoter(voter1);
      await votingInstance.addVoter(voter2);
      await votingInstance.startProposalsRegistering();
    });

    it('tally if 1000 proposals (POV voter1)', async () => {
      let i = 0;

      for (i = 0; i < 1000; i++) {
        await votingInstance.addProposal(`proposal ${i}`, { from: voter1 });
      }

      await expectRevert(
        votingInstance.addProposal(`proposal ${i}`, { from: voter1 }),
        'Too many proposals',
      );

      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      await votingInstance.setVote(1, { from: voter1 });
      await votingInstance.setVote(1, { from: voter2 });

      await votingInstance.endVotingSession();
      const result = await votingInstance.tallyVotes();
      await expectEvent(result, 'WorkflowStatusChange', {
        previousStatus: BN(WorkflowStatus.VotingSessionEnded),
        newStatus: BN(WorkflowStatus.VotesTallied),
      });
    });
  });
});
