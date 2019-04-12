const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const provider = ganache.provider();
const web3 = new Web3(provider);
web3.currentProvider.setMaxListeners(300); // or more :)

// run test

const compiledFactory = require("../ethereum/build/OpenElectionFactory.json");
const compiledOpenElection = require("../ethereum/build/OpenElection.json");

let accounts;
let factory;
let openElectionAddress;
let openElection;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  // aqui estamos gerando um novo contrato fábrica
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface)).
  deploy({
      data: compiledFactory.byte "code
    })
    .send({
      from: accounts[0],
      gas: "1000000"
    });

  //verificar abaixo o que estamos executando de fato na rede:
  //call or send?
  // estamos gerando um novo contrato de openElection
  await factory.methods.createOpenElection(2, 2, false).send({
    from: accounts[0], //manager
    gas: '1000000'
  });

  // aqui estamos pega ndo a primeira campanha gerada na vida da fabrica
  [openElectionAddress] = await factory.methods.getDeployedOpenElections().call();
  openElection = await new web3.eth.Contract(
    JSON.parse(compiledOpenElection.interface),
    openElectionAddress
  );
});

describe('OpenElections', () => {
  it('deploys a factory and a openElection', () => {
    assert.ok(factory.options.address);
    assert.ok(openElection.options.address);
  });

  it('marks caller as the openElection manager', async () => {
    const manager = await openElection.methods.manager().call();
    assert.equal(accounts[0], manager);
  });
});