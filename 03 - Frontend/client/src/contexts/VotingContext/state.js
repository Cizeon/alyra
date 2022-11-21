const actions = {
  CHANGE_STATUS: 'change-status',
  SET_ADMIN: 'set-admin',
  SET_VOTER: 'set-voter',
  SET_PROPOSALS: 'set-proposals',
  ADD_PROPOSAL: 'add-proposal',
  SET_HAS_VOTED: 'set-hasvoted',
};

const initialState = {
  workflowStatus: 0,
  isAdmin: false,
  isVoter: false,
  hasVoted: false,
  labels: [
    'Registering',
    'Proposing Start',
    'Proposing End',
    'Voting Start',
    'Voting End',
    'Tally',
  ],
  proposals: [],
};

const reducer = (state, action) => {
  const { type, data } = action;

  switch (type) {
    case actions.CHANGE_STATUS:
      return { ...state, workflowStatus: data };
    case actions.SET_ADMIN:
      return { ...state, isAdmin: data };
    case actions.SET_VOTER:
      return { ...state, isVoter: data };
    case actions.SET_PROPOSALS:
      return { ...state, proposals: data };
    case actions.ADD_PROPOSAL:
      return { ...state, proposals: [...state.proposals, data] };
    case actions.SET_HAS_VOTED:
      return { ...state, hasVoted: data };
    default:
      // throw new Error('Undefined reducer action type');
      return { ...state };
  }
};

export { actions, initialState, reducer };
