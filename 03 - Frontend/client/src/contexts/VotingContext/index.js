const WorkflowStatus = {
  RegisteringVoters: 0,
  ProposalsRegistrationStarted: 1,
  ProposalsRegistrationEnded: 2,
  VotingSessionStarted: 3,
  VotingSessionEnded: 4,
  VotesTallied: 5,
};

export * from './state';
export { default as useVoting } from './useVoting';
export { default as VotingContext } from './VotingContext';
export { default as VotingProvider } from './VotingProvider';
export { WorkflowStatus };
