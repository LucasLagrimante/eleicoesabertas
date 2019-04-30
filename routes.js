const routes = module.exports = require('next-routes')();

routes
  .add('/openElections/:address', '/openElections/show');
