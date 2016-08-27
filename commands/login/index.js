var debug   = require('debug')('login->index');
var Login   = require('./connector');
var assert  = require('assert');

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
    });
};

exports.handler = function (argv) {
    console.log('running');
    debug(`${argv.url}`);
    debug(`${JSON.stringify(argv)}`);
    debug(`${argv.user}`);
    debug(`${argv.token}`);



    var login = new Login(argv.url, argv);

    login.connect().then(login.getUserInfo.bind(login))
        .then((user) => {
            assert(login.token);
            debug(`after successfull login ${JSON.stringify(user)}`);
            console.log(`User '${user}' is succesfully logged in ${argv.url}`);
            process.exit(0);
        }, (error) => {
            console.log(`${error}`);
            process.exit(error);
        });
    // do something with argv.
};
