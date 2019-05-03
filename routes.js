const routes = module.exports = require('next-routes')();

routes
  .add('/openElections/new', '/openElections/new')
  .add('/openElections/:address', '/openElections/show')
  .add('/openElections/:address/createCandidate', '/openElections/createCandidate')
  .add('/openElections/:address/beAnVoter', '/openElections/beAnVoter');
