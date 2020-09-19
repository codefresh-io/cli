/* eslint-disable max-len */
const Command = require('../../Command');
const unInstallRoot = require('../root/uninstall.cmd');
const { downloadArgo } = require('../hybrid/helper');
const { Runner, components } = require('../../../../binary');


const unInstallAgentCmd = new Command({
    root: false,
    parent: unInstallRoot,
    command: 'argocd-agent',
    description: 'Uninstall argo agent',
    webDocs: {
        category: 'Argo',
        title: 'Uninstall',
        weight: 100,
    },
    builder: yargs => yargs
        .env('CF_ARG_'),
    handler: async () => {
        const binLocation = await downloadArgo();
        const componentRunner = new Runner(binLocation);
        const commands = [
            'uninstall',
        ];
        await componentRunner.run(components.argo, commands);
    },
});

module.exports = unInstallAgentCmd;
