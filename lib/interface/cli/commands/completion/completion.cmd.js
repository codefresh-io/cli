const yargs = require('yargs');
const Command = require('../../Command');
const path = require('path');
const fs = require('fs');

/**
 * yargs script generation file redone
 * */
function _generateCompletionScript(appPath, appName, completionCommand, shell) {
    let script = fs.readFileSync(
        path.resolve(__dirname, `${shell}.sh.hbs`),
        'utf-8',
    );
    const name = appName || path.basename(appPath);

    script = script.replace(/{{app_name}}/g, name);
    script = script.replace(/{{completion_command}}/g, completionCommand);
    return script.replace(/{{app_path}}/g, appPath);
}

const command = new Command({
    root: true,
    command: 'completion [shell-name]',
    requiresAuthentication: false,
    aliases: ['completions'],
    description: 'Generate codefresh completion',
    usage: 'Prints completion script with specified or default path to executable and command alias',
    webDocs: {
        category: 'Completion',
        title: 'Codefresh Completion',
        description: 'Generate codefresh completion. See details on [usage](codefresh-completion)',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .positional('shellName', {
                description: 'Name of the shell to generate completion for',
                choices: ['bash', 'zsh'],
                default: 'bash',
            })
            .option('executable', {
                alias: 'e',
                description: 'Name or path to your codefresh executable (default same as alias)',
            })
            .option('alias', {
                alias: 'a',
                description: 'Alias used for calling codefresh executable',
                default: 'codefresh',
            })
            .example('codefresh completion', 'Print bash completion script')
            .example('codefresh completion zsh', 'Print zsh completion script')
            .example('codefresh completion zsh >> ~/.zshrc', 'Install zsh completion script')
            .example('codefresh completion bash >> ~/.bashrc', 'Install bash completion script')
            .example('codefresh completion bash >> ~/.bash_profile', 'Install bash completion script (on OSX)')
            .example('cf completion --alias cf', 'Print completion script for codefresh aliased as "cf"')
            .example('/some/path/codefresh completion -e /some/path/codefresh', 'Print completion script with specified path to codefresh executable');
    },
    handler: async (argv) => {
        const { executable, alias: appName, shellName } = argv;
        const appPath = executable || appName;
        const script = _generateCompletionScript(appPath, appName, 'completion', shellName);
        console.log(script);
    },
});

module.exports = command;
