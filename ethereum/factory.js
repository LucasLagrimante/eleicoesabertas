import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0x5Fc18e0116dACDEe6b79CE82aE083b1f691c7bFb'
);

export default instance;
