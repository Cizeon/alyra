// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';

contract Voting is Ownable {
  enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
  }
  WorkflowStatus currentState;

  struct Voter {
    bool isRegistered;
    bool hasVoted;
    uint256 votedProposalId;
  }

  struct Vote {
    string description;
    /* Store the vote winners. If there is more than one, the ownern needs
       to choose one. */
    uint256[] winners;
  }
  Vote vote;

  struct Proposal {
    string description;
    uint256 voteCount;
  }
  Proposal[] proposals;

  mapping(address => Voter) whitelist;
  uint256 winningProposalId;

  uint256 tipAmount = 0;

  event VoterRegistered(address voterAddress);
  event VoterUnregistered(address voterAddress);
  event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
  event ProposalRegistered(uint256 proposalId);
  event Voted(address voter, uint256 proposalId);
  event Draw(uint256[]);
  event TipReceived(address _from, uint256 _amount);
  event TipWithdrawn(uint256 _amount);

  /**
   * Check if an address is in the white list before accepting to call the function.
   */

  modifier isAuthorized() {
    require(whitelist[msg.sender].isRegistered, 'you are not allowed');
    _;
  }

  /**
   * Check that we are at the proper state before continuing.
   */

  modifier checkState(WorkflowStatus _state) {
    require(currentState == _state, 'wrong state');
    _;
  }

  /**
   * Check that we cannot receive tips when the owner cast a draw.
   */
  modifier isNotDraw() {
    require(vote.winners.length < 2, 'cannot receive tips during a draw');
    _;
  }

  /**
   * Add an address to the whitelist to allow the address to vote.
   */

  function register(address _address)
    public
    onlyOwner
    checkState(WorkflowStatus.RegisteringVoters)
  {
    whitelist[_address].isRegistered = true;
    emit VoterRegistered(_address);
  }

  /**
   * Remove an address to the whitelist to forbid them from voting.
   */

  function unregister(address _address)
    public
    onlyOwner
    checkState(WorkflowStatus.RegisteringVoters)
  {
    whitelist[_address].isRegistered = false;
    emit VoterUnregistered(_address);
  }

  /**
   * Check if an address is registerd.
   */
  function isRegistered(address _address) public view returns (bool) {
    return whitelist[_address].isRegistered;
  }

  /*
   * Check if a user can vote.
   * @return true if the adddress is allowed to vote.
   */
  function canVote(address _address) public view returns (bool) {
    return whitelist[_address].isRegistered;
  }

  /*
   * Change currentState. Not publicly available.
   */

  function changeState(WorkflowStatus _state) private onlyOwner {
    WorkflowStatus oldState = currentState;
    currentState = _state;
    emit WorkflowStatusChange(oldState, currentState);
  }

  /**
   * Reset the vote, to create a new one.
   * @dev We can reset a vote at any state. All proposals are lost.
   */

  function reset() public onlyOwner {
    vote.description = '';
    delete proposals;
    changeState(WorkflowStatus.RegisteringVoters);
  }

  /**
   * Create a new vote. Change the status.
   */

  function createVote(string calldata _description)
    public
    onlyOwner
    checkState(WorkflowStatus.RegisteringVoters)
  {
    vote.description = _description;
    delete proposals;
    changeState(WorkflowStatus.ProposalsRegistrationStarted);
  }

  /**
   * @return The description of a vote.
   */
  function getVoteDescription() public view returns (string memory) {
    return vote.description;
  }

  /**
   * Compare two strings.
   * @return Return true if matches.
   */

  function stringEqual(string memory a, string memory b) public pure returns (bool) {
    return (bytes(a).length == bytes(b).length) && (keccak256(bytes(a)) == keccak256(bytes(b)));
  }

  /**
   * During the proposal state, every white listed person can propose and when registration is ongoing.
   */

  function addProposal(string calldata _description)
    public
    isAuthorized
    checkState(WorkflowStatus.ProposalsRegistrationStarted)
  {
    /* Check if the proposal has already been submitted. 
           Someone could abuse this to mess with others proposal. */
    for (uint256 i = 0; i < proposals.length; i++) {
      if (stringEqual(_description, proposals[i].description)) {
        revert('proposal already submitted');
      }
    }

    Proposal memory p = Proposal(_description, 0);
    proposals.push(p);
    /* The proposal id is the last element of the table. */
    emit ProposalRegistered(proposals.length - 1);
  }

  /**
   * @return All registered proposals.
   */

  function getProposals() public view returns (Proposal[] memory) {
    return proposals;
  }

  /**
   * Stop the proposal phase. If they are no proposals, you must wait longer or reset.
   */

  function stopProposalPhase()
    public
    onlyOwner
    checkState(WorkflowStatus.ProposalsRegistrationStarted)
  {
    require(proposals.length > 0, 'no proposals');
    changeState(WorkflowStatus.ProposalsRegistrationEnded);
  }

  /**
   * Starting the votes, let the rumble begin.
   */

  function startVotingPhase()
    public
    onlyOwner
    checkState(WorkflowStatus.ProposalsRegistrationEnded)
  {
    changeState(WorkflowStatus.VotingSessionStarted);
  }

  /**
   * Cast a vote.
   */

  function voteFor(uint256 _id)
    public
    isAuthorized
    checkState(WorkflowStatus.VotingSessionStarted)
  {
    require(!whitelist[msg.sender].hasVoted, 'already voted');
    require(_id < proposals.length, 'wrong proposal id');
    proposals[_id].voteCount++;
    whitelist[msg.sender].hasVoted = true;
    whitelist[msg.sender].votedProposalId = _id; /* Votes are public */
    emit Voted(msg.sender, _id);
  }

  /**
   * Stop voting phase.
   */

  function stopVotingPhase() public onlyOwner checkState(WorkflowStatus.VotingSessionStarted) {
    changeState(WorkflowStatus.VotingSessionEnded);
  }

  /**
   * Cast a vote.
   */
  function recordVote(uint256 _id) private {
    vote.winners = [_id];
    winningProposalId = _id;
    changeState(WorkflowStatus.VotesTallied);
  }

  /**
   * Close the votes. Compute the results into a winner array.
   * Everyone is free to pay the gas to tally votes :-).
   */

  function tallyVotes() public checkState(WorkflowStatus.VotingSessionEnded) {
    vote.winners.push(0);
    for (uint256 i = 1; i < proposals.length; i++) {
      if (proposals[i].voteCount > proposals[vote.winners[0]].voteCount) {
        delete vote.winners;
        vote.winners.push(i);
      } else if (proposals[i].voteCount == proposals[vote.winners[0]].voteCount) {
        vote.winners.push(i);
      }
    }
    /* If we have only one winner, then the vote is tallied. */
    if (vote.winners.length == 1) {
      return recordVote(vote.winners[0]);
    }

    emit Draw(vote.winners);
  }

  /**
   * If there are multiple winners, the contract owner chooses the winner and tally the votes.
   */

  function castVote(uint256 _id) public onlyOwner checkState(WorkflowStatus.VotingSessionEnded) {
    require(vote.winners.length > 1, 'tally first');
    for (uint256 i = 0; i < vote.winners.length; i++) {
      if (vote.winners[i] == _id) {
        return recordVote(_id);
      }
    }
    revert('wrong proposal id');
  }

  /**
   * Return the winning proposals. If there is more than one,
   * the owner needs to select on to get the VotesTallied status.
   */

  function getWinners() public view returns (uint256[] memory) {
    require(
      currentState == WorkflowStatus.VotingSessionEnded ||
        currentState == WorkflowStatus.VotesTallied,
      'wrong state'
    );
    return vote.winners;
  }

  /**
   * @return The winner of the vote.
   */

  function getWinner() public view checkState(WorkflowStatus.VotesTallied) returns (uint256) {
    return winningProposalId;
  }

  /**
   * @return Vote description and winning proposal.
   */

  function getWinnerDescription()
    public
    view
    checkState(WorkflowStatus.VotesTallied)
    returns (string memory)
  {
    require(vote.winners.length == 1, 'draw');
    return proposals[vote.winners[0]].description;
  }

  /**
   * Small tip section, in case we have generous donors ;-)
   */

  receive() external payable isNotDraw {
    /* Thank you for the tip. */
    tipAmount += msg.value;
    emit TipReceived(msg.sender, msg.value);
  }

  fallback() external payable isNotDraw {
    /* Thank you for the tip. */
    tipAmount += msg.value;
    emit TipReceived(msg.sender, msg.value);
  }

  /**
   * Withdraw tips.
   * @dev We do not need to protect from re-entrancy attacks since it's onlyOwner.
   */

  function withdrawTips() public onlyOwner {
    (bool sent, ) = msg.sender.call{ value: tipAmount }('');
    require(sent);
    tipAmount = 0;
    emit TipWithdrawn(tipAmount);
  }
}
