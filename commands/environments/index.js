#!/usr/bin/env node

var commands = [
    'create',
    'list',
    'status',
    'terminate'
];

var usage = function() {
    console.log(
        "cf-cli environments <command>\n" +
        "  " + commands.join(", ")

    );
}

var process_command = function() {
    var command = process.argv.shift();

    if (commands.indexOf(command) === -1) {
        return usage();
    }

    require('./' + command);
}

process_command();
