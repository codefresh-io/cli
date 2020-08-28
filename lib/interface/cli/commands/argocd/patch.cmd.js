const Command = require('../../Command');

const applyRoot = require('../root/apply.cmd');
const { downloadArgo } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');

const command = new Command({
    root: false,
    parent: applyRoot,
    command: 'argocd-agent',
    description: 'Patch argo agent',
    webDocs: {
        category: 'Argo',
        title: 'Patch',
        weight: 100,
    },
    builder: (yargs) => {
        yargs
            .example(
                'codefresh patch argocd-agent',
                'Update argocd-agent',
            );
    },
    handler: async () => {
        const binLocation = await downloadArgo();
        const componentRunner = new Runner(binLocation);

        const commands = [
            'update',
        ];

        await componentRunner.run(components.argo, commands);
    },
});

module.exports = command;
