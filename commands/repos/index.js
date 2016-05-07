var program = require('commander');

var commands = [
    'list'
];

var process_command = function(command, repoId) {
    require('./' + command)(repoId);
}


program
    .command('repos [command] [repoId]')
    .description('run setup commands for all envs')
    .action(function(command, repoId){
        process_command(command || 'show', repoId);
    });
