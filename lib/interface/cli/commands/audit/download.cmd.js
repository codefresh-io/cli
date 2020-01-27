const fs = require('fs');
const moment = require('moment');
const Command = require('../../Command');
const getRoot = require('../root/download.cmd');
const openApi = require('../../../../../openapi.json');
const { sdk } = require('../../../../logic');

const DEFAULT_DIR = process.cwd();
const DEFAULT_FILE_NAME = `codefresh_audit_${moment(new Date())
    .format('YYYY-MM-DD_HH-mm-ss')}.csv`;

const apiParameters = openApi.paths['/audit/download'].get.parameters
    .map(({ name, description, schema }) => ({
        name,
        description,
        choices: schema.enum,
    }));

function _buildRequestOptions(argv){
    return apiParameters.reduce((memo, { name } = {}) => {
        if (name in argv) {
            Object.assign(memo, { [name]: argv[name] });
        }
        return memo;
    }, {});
}

const command = new Command({
    command: 'audit',
    parent: getRoot,
    description: 'Download audit',
    webDocs: {
        category: 'Audit',
        title: 'Download',
    },
    builder: (yargs) => {
        apiParameters
            .forEach(({ name, description, choices }) => {
                yargs.option(name, Object.assign({ describe: description }, choices && { choices }));
            });

        return yargs
            .option('file', {
                describe: 'The name of the file and the directory in which the audit will be saved',
                default: `${DEFAULT_DIR}/${DEFAULT_FILE_NAME}`,
            })
            .example('codefresh download audit --file /var/www/audit.csv')
            .example('--entity account --rs_status 200 --sortType DESK --sortField createdAt');
    },
    handler: async (argv) => {
        const requestOptions = _buildRequestOptions(argv);
        const content = await sdk.audit.download(requestOptions);
        fs.writeFileSync(argv.file, content, 'utf-8');
    },
});

module.exports = command;
