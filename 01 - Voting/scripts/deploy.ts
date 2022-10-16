import hre from 'hardhat';

const main = async () => {
  await hre.ethers.provider.ready;
  const [deployer] = await hre.ethers.getSigners();
  let balance = await deployer.getBalance();
  console.log(`[+] Deployer balance: ${balance.toString()}`);

  /* Deploy the smart contract */
  const votingContractFactory = await hre.ethers.getContractFactory('Voting');
  const votinContract = await votingContractFactory.deploy();
  await votinContract.deployed();
  console.log('Contract deployed to:', votinContract.address);

  balance = await deployer.getBalance();
  console.log(`[+] Deployer balance: ${balance.toString()}`);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
