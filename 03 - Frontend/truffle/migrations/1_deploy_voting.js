const Voting = artifacts.require('Voting');

const question = 'What is the best blockchain school?';

module.exports = function (deployer) {
  deployer.deploy(Voting, question);
};
