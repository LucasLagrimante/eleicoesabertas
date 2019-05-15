import web3 from './web3';
import OpenElection from './build/OpenElection.json';

export default address => {
  return new web3.eth.Contract(
    JSON.parse(OpenElection.interface),
    address
  );
};
