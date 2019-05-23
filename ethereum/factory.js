import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0x79fFd31263DbF3B3416A7b692cB9082B05F9336d'
);

export default instance;
