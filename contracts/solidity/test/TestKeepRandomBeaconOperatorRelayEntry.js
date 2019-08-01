import exceptThrow from './helpers/expectThrow';
import {bls} from './helpers/data';
import {initContracts} from './helpers/initContracts';

contract('TestKeepRandomBeaconOperatorRelayEntry', function(accounts) {
  let config, serviceContract, operatorContract;

  before(async () => {

    let contracts = await initContracts(
      accounts,
      artifacts.require('./KeepToken.sol'),
      artifacts.require('./StakingProxy.sol'),
      artifacts.require('./TokenStaking.sol'),
      artifacts.require('./KeepRandomBeaconService.sol'),
      artifacts.require('./KeepRandomBeaconServiceImplV1.sol'),
      artifacts.require('./KeepRandomBeaconOperatorStub.sol')
    );

    config = contracts.config;
    operatorContract = contracts.operatorContract;
    serviceContract = contracts.serviceContract;
    // operatorContract.authorizeServiceContract(serviceContract.address);

    // Using stub method to add first group to help testing.
    await operatorContract.registerNewGroup(bls.groupPubKey);
    let minimumPayment = await serviceContract.minimumPayment()
    await serviceContract.requestRelayEntry(bls.seed, {value: minimumPayment});
  });

  it("should not be able to submit invalid relay entry", async function() {
    // Invalid signature
    let groupSignature = web3.utils.toBN('0x0fb34abfa2a9844a58776650e399bca3e08ab134e42595e03e3efc5a0472bcd8');

    await exceptThrow(operatorContract.relayEntry(groupSignature, bls.groupPubKey, bls.previousEntry, bls.seed));
  });

  it("should be able to submit valid relay entry", async function() {
    await operatorContract.relayEntry(bls.groupSignature, bls.groupPubKey, bls.previousEntry, bls.seed);

    assert.equal((await serviceContract.getPastEvents())[0].args['entry'].toString(),
      bls.groupSignature.toString(), "Should emit event with successfully submitted groupSignature."
    );
  });
});