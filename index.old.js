#!/usr/bin/env node

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
