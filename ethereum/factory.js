import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0x57b4038503e4eCDF178C524e783e9d67ff6eA99c'
);

export default instance;
