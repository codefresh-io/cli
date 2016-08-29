var path = require('path');

var commands = [
    //'create',
    'list',
    'status',
    'terminate'
];

commands.forEach(function(commandId) {
    require(path.join(__dirname , commandId));
});

var usage = function() {
    console.log(
        "cf-cli environments <command>\n" +
        "  " + commands.join(", ")

    );
};

var process_command = function() {
    var command = process.argv.shift();

    if (commands.indexOf(command) === -1) {
        return usage();
    }

    require('./' + command);
};

process_command();
