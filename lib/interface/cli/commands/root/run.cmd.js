const Command = require('../../Command');

const annotate = new Command({
    root: true,
    command: 'run',
    description: 'Run a pipeline',
    builder: (yargs) => {
        return yargs
        //.example('$0 run pipeline id -b master', '# Run pipeline by ID using master branch')
        //.example('$0 run pipeline name repo-owner repo-name', '# Run pipeline by NAME, REPO-OWNER and REPO-NAME')
            .demandCommand(1, 'You need at least one command before moving on');
    },
});

module.exports = annotate;
