'use strict';

var debug   = require('debug')('compose command');
var Command = require('./command');

debug('in composition command defintion');

exports.command = 'composition <create> <name> <docker-compose-file> ';
exports.desc = 'create codefresh docker compose';
exports.builder = function (yargs) {
    return yargs
        .option('add', {

        })
        .option('delete', {
            alias: 'rm'
        })
        .option('name', {

        }).option('file', {
            alias: 'f',
            default : 'docker-compose.yaml'
        })
}
exports.handler = function (argv) {
    debug(`arguments are ${JSON.stringify(argv)}`);
    var command = new Command({accessToken : argv.accessToken,  url:argv.url});
    command.run(argv).then(()=>{
        console.log('action completed');
    }, (err)=>{
        console.log(`action failed with error ${err}`);
    })

}