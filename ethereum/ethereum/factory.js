import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xF0D1106aE297a815cf2a7f8Fb28f46f5E4056FD2'
);

export default instance;
