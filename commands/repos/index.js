#!/usr/bin/env node

var commands = [
    'list'
];

var usage = function() {
    console.log(
        "cf-cli repos <command>\n" +
        "  " + commands.join(", ")

    );
}

var process_command = function() {
    var command = process.argv[0];

    if (commands.indexOf(command) === -1) {
        command = 'show';
    }

    require('./' + command);
}

process_command();
