// my-module.js

console.log('login');
var debug   = require('debug')('login->index');
var Login   = require('../login/connector');
var assert  = require('assert');
exports.command = 'builds [filter] <repo>'

exports.describe = 'build in codefresh '

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
  //https://g.codefresh.io/api/builds/?limit=10&page=1&type=webhook
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
