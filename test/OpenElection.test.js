const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const provider = ganache.provider();
const web3 = new Web3(provider);
web3.currentProvider.setMaxListeners(300); // or more :)

// npm run test

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
      data: compiledFactory.bytecode
    })
    .send({
      from: accounts[0],
      gas: "3000000"
    });

  //verificar abaixo o que estamos executando de fato na rede:
  //call or send? send = custo
  // estamos gerando um novo contrato de openElection
  await factory.methods.createOpenElection(2, 2, false, 'Teste').send({
    from: accounts[0], //manager
    gas: '3000000'
  });

  // aqui estamos pegando a primeira Eleicao gerada na vida da fabrica
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

  it('add voters', async () => {
    await openElection.methods.beAnVoter('Lucas Lagrimante Martinho', '13075988626').send({
      from: accounts[1],
      gas: '3000000'
    });

    let numOfVoters = await openElection.methods.getNumOfVoters().call();
    assert(numOfVoters == 1);

    await openElection.methods.beAnVoter('Felippe Jabour', '12345678910').send({
      from: accounts[2],
      gas: '3000000'
    });

    numOfVoters = await openElection.methods.getNumOfVoters().call();
    assert(numOfVoters == 2);
  });

  it('add candidates', async () => {
    await openElection.methods.createCandidate('Candidato1', '13075988626', accounts[1]).send({
      from: accounts[0], //manager
      gas: '3000000'
    });

    let numOfCandidates = await openElection.methods.getNumOfCandidates().call();
    assert(numOfCandidates == 1);

    await openElection.methods.createCandidate('Candidato2', '12345678910', accounts[2]).send({
      from: accounts[0], //manager
      gas: '3000000'
    });

    numOfCandidates = await openElection.methods.getNumOfCandidates().call();
    assert(numOfCandidates == 2);
  });

  it('run a complete election and pick a winner', async () => {
    //creating
    await openElection.methods.beAnVoter('Lucas Lagrimante Martinho', '13075988626').send({
      from: accounts[1],
      gas: '3000000'
    });
    await openElection.methods.beAnVoter('Felippe Jabour', '12345678910').send({
      from: accounts[2],
      gas: '3000000'
    });
    await openElection.methods.createCandidate('Candidato1', '13075988626', accounts[3]).send({
      from: accounts[0],//manager
      gas: '3000000'
    });
    await openElection.methods.createCandidate('Candidato2', '12345678910', accounts[4]).send({
      from: accounts[0], //manager
      gas: '3000000'
    });
    assert(await openElection.methods.getNumOfCandidates().call() == 2);
    assert(await openElection.methods.getNumOfVoters().call() == 2);

    //start
    await openElection.methods.startOpenElection().send({
      from: accounts[0], //manager
      gas: '3000000'
    });

    //voting
    await openElection.methods.vote(accounts[3]).send({
      from: accounts[1], //manager
      gas: '3000000'
    });
    await openElection.methods.vote(accounts[3]).send({
      from: accounts[2], //manager
      gas: '3000000'
    });

    assert(await openElection.methods.isEnded().call());
    assert(await openElection.methods.totalVotes().call() == 2);
    assert(await openElection.methods.winner().call() == accounts[3])
  });
});
