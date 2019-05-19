import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xfA9DF6F6e9683AB1F0026E734AaF8970C61b1553'
);

export default instance;
