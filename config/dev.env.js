const prodEnv = require('./prod.env');

module.exports = Object.assign({}, prodEnv, {
  NODE_ENV: '"development"',
  VUE_ENV: '"development"',
});
