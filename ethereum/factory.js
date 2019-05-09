import web3 from './web3';
import OpenElectionFactory from './build/OpenElectionFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(OpenElectionFactory.interface),
  '0xd2cbDDbF971714Aa84D9F4cC21e5A9Eb5E1C0CAd'
);

export default instance;
