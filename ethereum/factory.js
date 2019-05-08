import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xE05AEC82BBa738ffFe0Bc610aEc18c886554f319'
);

export default instance;
