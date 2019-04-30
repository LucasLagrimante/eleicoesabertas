import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xf885754f96444A7C197fa82Bf8414f4Cc977f856'
);

export default instance;
