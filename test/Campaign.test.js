const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const provider = ganache.provider();
const web3 = new Web3(provider);
web3.currentProvider.setMaxListeners(300); // or more :)

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaingnAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  // aqui estamos gerando um novo contrato fábrica
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface)).
  deploy({
      data: compiledFactory.bytecode
    })
    .send({
      from: accounts[0],
      gas: "1000000"
    });

  //verificar abaixo o que estamos executando de fato na rede:
  //call or send?
  // estamos gerando um novo contrato de campaign
  await factory.methods.createCampaign("100", "Test 1").send({
    from: accounts[0], //manager
    gas: '1000000'
  });

  // aqui estamos pega ndo a primeira campanha gerada na vida da fabrica
  [campaingnAddress] = await factory.methods.getDeployedCampaingns().call();
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaingnAddress
  );
});

describe('Campaingns', () => {
  it('deploys a factory and a campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute money and marks them as approvers', async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1]
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    let errThrown;
    try {
      await campaign.methods.contribute().send({
        value: '99',
        from: accounts[1]
      });
    } catch (e) {
      assert(e);
      return;
    }
    assert(false);
  });

  it('allows a manager to make a payment request', async () => {
    await campaign.methods
      .createRequest('Buy batteries', '100', accounts[3])
      .send({
        from: accounts[0],
        gas: '1000000'
      });
    const request = await campaign.methods.requests(0).call();
    assert.equal('Buy batteries', request.description);
  });

  it('processes request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", 'ether')
    });

    await campaign.methods
      .createRequest('A', web3.utils.toWei("5", 'ether'), accounts[4])
      .send({
        from: accounts[0],
        gas: '1000000'
      });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000"
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000"
    });

    let balance = await web3.eth.getBalance(accounts[4]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});