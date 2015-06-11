#!/usr/bin/env node

var program = require('commander'),
    path    = require('path'),
    fs      = require('fs');


program
    .version('0.0.1');


var commandsPath = path.join(__dirname, 'commands');
fs.readdir(commandsPath, function(err, files){
    files.map(function(file) {
        require(path.join(commandsPath , file));
    });

    program.parse(process.argv);
});

return;

process.argv.shift();
process.argv.shift();

var commands = [
    'environments',
    'init',
    'install',
    'repos',
    'start'
];

var setup_logging = function() {

}

var usage = function() {
    console.log(
        "cf-cli <command>\n" +
        "  " + commands.join(", ")

    );
}

var process_command = function() {
    var command = process.argv.shift();

    if (commands.indexOf(command) === -1) {
        return usage();
    }

    require('./commands/' + command);
}

setup_logging();
process_command();
