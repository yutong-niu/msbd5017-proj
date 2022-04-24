const routes = require('next-routes')();

routes
    .add('/register', 'register')
    .add('/domains/:address', '/domains/mgmt')

module.exports = routes;