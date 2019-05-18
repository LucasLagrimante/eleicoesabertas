const routes = module.exports = require('next-routes')();

routes
  .add('/openElections/new', '/openElections/new')
  .add('/openElections/:address', '/openElections/index')
  .add('/openElections/:address/voting', '/openElections/voting')
  .add('/openElections/:address/beAnVoter', '/openElections/beAnVoter')
  .add('/openElections/:address/finalResult', '/openElections/finalResult')
  .add('/openElections/:address/admin', '/openElections/admin/index')
  .add('/openElections/:address/admin/createCandidate', '/openElections/admin/createCandidate')
  .add('/openElections/:address/admin/requests', '/openElections/admin/requests/index');

