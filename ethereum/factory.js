import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xa44b5d4dA72fb83c1a44Ee1E87Fb75EF6e3b6095'
);

export default instance;
