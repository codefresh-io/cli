var debug   = require('debug')('login->index');
var Login   = require('./connector');
var assert  = require('assert');
var prettyjson = require('prettyjson');

debug(' start init login commmand');

exports.command = 'login [url]  <user> <pwd>';

exports.describe = 'login to codefresh';

exports.builder = function (yargs) {
    return yargs.option('url', {
        alias: 'url',
        default: 'https://g.codefresh.io'
    }).option('user', {
        alias: 'u',
        demand : true
    }).option('pwd', {
        alias: 'p',
        demand : false
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    debug(`${argv.url}`);
    debug(`${JSON.stringify(argv)}`);
    debug(`${argv.user}`);
    debug(`${argv.token}`);

    var login = new Login(argv.url, argv);
    login.connect().then(login.getUserInfo.bind(login))
        .then((user) => {
            assert(login.token);
            debug(`after successfull login ${JSON.stringify(user.toString())}`);
            console.log('Now you logged in as');
            console.log(prettyjson.render(user.toString()));
            process.exit(0);
        }, (error) => {
            console.log(`${error}`);
            process.exit(error);
        });
};
