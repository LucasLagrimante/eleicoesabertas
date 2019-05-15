//how to
// node deploy.js
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require("web3");

const compiledFactory = require("./build/OpenElectionFactory.json");

const provider = new HDWalletProvider(
  'steak receive false exhibit movie permit medal guilt muscle acid company drill',
  'https://rinkeby.infura.io/v3/8b06533aceb84213b1c59620f8dfedc1'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account ', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
      data: '0x' + compiledFactory.bytecode
    }) // add bytecode
    .send({
      from: accounts[0]
    }); // remove gas

  console.log('Contract deployed to ', result.options.address);
};

deploy();
