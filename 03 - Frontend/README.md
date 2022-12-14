# Dapp

The Dapp was deployed on Vercel: https://alyra-cizeon.vercel.app/

For the demo, you can use the wallet below to see the voting result.

- Address: 0x210B8E2B9B15dd618d5008CDD8A8aa7e462D2Fe4
- Mnemonic: pride unknown dentist lucky adult few catch police ride orbit mask parrot
- PrivateKey: 0xfe5b40e80f4eca8e829fa57034d85989d818c7502f9c307c8955ba3af479de11

# Contracts Modifications

The requirements was to modify the given contract the less possible, only adding meaningful changes.

I added a DOS protection when submitting proposals

```solidity
require(proposalsArray.length <= 1000, 'Too many proposals');
```

And tested it was still possible to tally with this amount of proposals:

```console
    Testing DOS adding proposals
      ✓ tally if 1000 proposals (POV voter1) (11404ms, 61335302 gas)
```

I added the voting question on chain, also.

```solidity
string public question;

constructor(string memory _question) Ownable() {
  question = _question;
}
```

Added comments to the original smart contract.

# Contract on Goerli

The contract on Goerli: https://goerli.etherscan.io/address/0xe451b90f00e72d0a5f9f9c550b83eedd7d66d094

You can check the transaction's history for a voting round.

```console
   Deploying 'Voting'
   ------------------
   > transaction hash:    0xd1bcd4bf4b0b3ca1e6f825b39ada2429eb480a1fb51a8bf3b226f29ce011f622
   > Blocks: 1            Seconds: 12
   > contract address:    0xE451B90f00e72D0a5F9F9C550b83eEdD7d66D094
   > block number:        7993729
   > block timestamp:     1669043016
   > account:             0x6D5904167423e36A07427340d14804798039D4e6
   > balance:             1.893677522536630462
   > gas used:            1237873 (0x12e371)
   > gas price:           69.891055595 gwei
   > value sent:          0 ETH
   > total cost:          0.086516250662549435 ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:     0.086516250662549435 ETH

Summary
=======
> Total deployments:   1
> Final cost:          0.086516250662549435 ETH
```
