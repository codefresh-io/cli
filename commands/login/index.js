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
      alias: 'u',
    }).option('password', {
      alias: 'pwd',

    })
  }


exports.handler = function (argv) {
  console.log('running');
  console.log(`${argv.url}`);
  login = new Login(argv.user, argv.pwd, argv.url);

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
