// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title Single voting contract.
 * @notice Only owner can create a new vote and register voters. Voters can
 * add proposals, vote and see the result. If the vote results in a draw,
 * the first proposal wins.
 * @dev Conduct a vote following these steps: addVoter(),
 * startProposalsRegistering(), addProposal(), endProposalsRegistering(),
 * startVotingSession(), setVote(), endVotingSession(), tallyVotes()
 */
contract Voting is Ownable {
  uint256 public winningProposalID;
  string public question;

  struct Voter {
    bool isRegistered;
    bool hasVoted;
    uint256 votedProposalId;
  }

  struct Proposal {
    string description;
    uint256 voteCount;
  }

  enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
  }

  WorkflowStatus public workflowStatus;
  Proposal[] proposalsArray;
  mapping(address => Voter) voters;

  event VoterRegistered(address voterAddress);
  event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
  event ProposalRegistered(uint256 proposalId);
  event Voted(address voter, uint256 proposalId);

  modifier onlyVoters() {
    require(voters[msg.sender].isRegistered, "You're not a voter");
    _;
  }

  /**
   * The question to vote is written on chain.
   */
  constructor(string memory _question) Ownable() {
    question = _question;
  }

  /**
   * Get the voter's information based on the wallet address.
   * @dev Restricted to voters.
   * @param _addr Voter's address.
   * @return Voter's information.
   */
  function getVoter(address _addr) external view onlyVoters returns (Voter memory) {
    return voters[_addr];
  }

  /**
   * Get the proposal's details.
   * @dev Restricted to voters.
   * @param _id Proposal id.
   * @return Proposal's details.
   */
  function getOneProposal(uint256 _id) external view onlyVoters returns (Proposal memory) {
    return proposalsArray[_id];
  }

  /**
   * Add a voter.
   * @dev Restricted to the owner.
   * @param _addr Voter's address.
   */
  function addVoter(address _addr) external onlyOwner {
    require(
      workflowStatus == WorkflowStatus.RegisteringVoters,
      'Voters registration is not open yet'
    );
    require(voters[_addr].isRegistered != true, 'Already registered');

    voters[_addr].isRegistered = true;
    emit VoterRegistered(_addr);
  }

  /**
   * Add a new proposal.
   * @param _desc Proposal's description.
   * @dev Restricted to voters.
   */
  function addProposal(string calldata _desc) external onlyVoters {
    /* Fixing a potential DOS if there are too many proposals in the array. */
    require(proposalsArray.length <= 1000, 'Too many proposals');
    require(
      workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
      'Proposals are not allowed yet'
    );
    require(
      keccak256(abi.encode(_desc)) != keccak256(abi.encode('')),
      'Vous ne pouvez pas ne rien proposer'
    ); // facultatif
    // voir que desc est different des autres

    Proposal memory proposal;
    proposal.description = _desc;
    proposalsArray.push(proposal);
    emit ProposalRegistered(proposalsArray.length - 1);
  }

  /**
   * Cast a vote.
   * @param _id Proposal's id.
   * @dev Restricted to voters.
   */
  function setVote(uint256 _id) external onlyVoters {
    require(
      workflowStatus == WorkflowStatus.VotingSessionStarted,
      'Voting session havent started yet'
    );
    require(voters[msg.sender].hasVoted != true, 'You have already voted');
    require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

    voters[msg.sender].votedProposalId = _id;
    voters[msg.sender].hasVoted = true;
    proposalsArray[_id].voteCount++;

    emit Voted(msg.sender, _id);
  }

  /**
   * Start proposal registration.
   * @dev Restricted to voters.
   */
  function startProposalsRegistering() external onlyOwner {
    require(
      workflowStatus == WorkflowStatus.RegisteringVoters,
      'Registering proposals cant be started now'
    );
    workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

    Proposal memory proposal;
    proposal.description = 'GENESIS';
    proposalsArray.push(proposal);

    emit WorkflowStatusChange(
      WorkflowStatus.RegisteringVoters,
      WorkflowStatus.ProposalsRegistrationStarted
    );
  }

  /**
   * End proposal registration.
   * @dev Restricted to voters.
   */
  function endProposalsRegistering() external onlyOwner {
    require(
      workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
      'Registering proposals havent started yet'
    );
    workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
    emit WorkflowStatusChange(
      WorkflowStatus.ProposalsRegistrationStarted,
      WorkflowStatus.ProposalsRegistrationEnded
    );
  }

  /**
   * Start the voting session.
   * @dev Restricted to voters.
   */
  function startVotingSession() external onlyOwner {
    require(
      workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
      'Registering proposals phase is not finished'
    );
    workflowStatus = WorkflowStatus.VotingSessionStarted;
    emit WorkflowStatusChange(
      WorkflowStatus.ProposalsRegistrationEnded,
      WorkflowStatus.VotingSessionStarted
    );
  }

  /**
   * Stop the voting session.
   * @dev Restricted to voters.
   */
  function endVotingSession() external onlyOwner {
    require(
      workflowStatus == WorkflowStatus.VotingSessionStarted,
      'Voting session havent started yet'
    );
    workflowStatus = WorkflowStatus.VotingSessionEnded;
    emit WorkflowStatusChange(
      WorkflowStatus.VotingSessionStarted,
      WorkflowStatus.VotingSessionEnded
    );
  }

  /**
   * Tally votes
   * @dev On draw, first proposal wins.
   */
  function tallyVotes() external onlyOwner {
    require(
      workflowStatus == WorkflowStatus.VotingSessionEnded,
      'Current status is not voting session ended'
    );
    uint256 _winningProposalId;
    for (uint256 p = 0; p < proposalsArray.length; p++) {
      if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
        _winningProposalId = p;
      }
    }
    winningProposalID = _winningProposalId;

    workflowStatus = WorkflowStatus.VotesTallied;
    emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
  }
}
