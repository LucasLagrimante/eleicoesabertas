import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xD28559f4F1687f2991e809BdBc4345b74B5de05F'
);

export default instance;
