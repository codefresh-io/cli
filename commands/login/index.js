// my-module.js

console.log('login');
var debug   = require('debug')('login->index');
var Login   = require('./connector');
var assert  = require('assert');
exports.command = 'login [url]  <user> <pwd>'

exports.describe = 'login to codefresh'

exports.builder = function (yargs) {
    return yargs.option('url', {
      alias: 'url',
      default: 'https://g-staging.codefresh.io'
    }).option('user', {
      alias: 'u'
    }).option('password', {
      alias: 'p'
    })
  }


exports.handler = function (argv) {
  console.log('running');
  debug(`${argv.url}`);
  debug(`${JSON.stringify(argv)}`);
  debug(`${argv.user}`);
  debug(`${argv.token}`);

  login = new Login(argv.user, argv.password, argv.url, argv.token);

  login.connect().then(login.getUserInfo.bind(login)).then((user)=>{

     assert(login.token);
     debug(`after successfull login ${JSON.stringify(user)}`);
     console.log(`${user.id} is succesfully logged in`);

     process.exit(0);
  }, (error)=>{
    console.log(`${error}`);
     process.exit(error);
  });
  // do something with argv.
}
