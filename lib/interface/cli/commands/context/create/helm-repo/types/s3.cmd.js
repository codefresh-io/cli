const debug = require('debug')('codefresh:cli:create:context:helmRepo:s3');
const Command = require('../../../../../Command');
const CFError = require('cf-errors');
const createHelmRepoCmd = require('./../base.cmd');
const { context } = require('../../../../../../../logic/index').api;

const AWS = {
    keyId: {
        awsEnvVar: 'AWS_ACCESS_KEY_ID',
    },
    secretKey: {
        awsEnvVar: 'AWS_SECRET_ACCESS_KEY',
    },
    region: {
        awsEnvVar: 'AWS_DEFAULT_REGION',
    },
};

AWS.keyId.cliFlag = AWS.keyId.awsEnvVar.replace(/_/g, '-').toLowerCase();
AWS.secretKey.cliFlag = AWS.secretKey.awsEnvVar.replace(/_/g, '-').toLowerCase();
AWS.region.cliFlag = AWS.region.awsEnvVar.replace(/_/g, '-').toLowerCase();

const command = new Command({
    command: 's3 <name>',
    parent: createHelmRepoCmd,
    description: 'Create a helm-repository context from s3 bucket',
    usage: `
    Helm repository can be stored in AWS S3 bucket.
    Codefresh will integrate with the bucket in the following order
    If environment variables ${AWS.keyId.awsEnvVar}, ${AWS.secretKey.awsEnvVar} ,${AWS.region.awsEnvVar} are set, will use it to create context.
    You can override them using flags ${AWS.keyId.cliFlag} ${AWS.secretKey.cliFlag} ${AWS.region.cliFlag}`,
    webDocs: {
        category: 'Create Helm-Repository Context',
        subCategory: 'S3',
        title: 'From AWS S3 bucket',
        weight: 20,
    },
    builder: (yargs) => {
        yargs
            .option(AWS.keyId.cliFlag, {
                describe: 'Amazon access key id',
                default: process.env[AWS.keyId.awsEnvVar],
                required: true,
            })
            .option(AWS.secretKey.cliFlag, {
                describe: 'Amazon access secret key with permissions to the bucket',
                default: process.env[AWS.secretKey.awsEnvVar],
                required: true,
            })
            .option(AWS.region.cliFlag, {
                describe: 'Amazon default region',
                default: process.env[AWS.region.awsEnvVar],
                required: true,
            })
            .option('bucket', {
                describe: 'Name of the bucket',
                required: true,
            });
        return yargs;
    },
    handler: async (argv) => {
        let bucket = '';
        if (argv.bucket.startsWith('s3://')) {
            ({ bucket } = argv);
        } else {
            bucket = `s3://${argv.bucket}`;
        }

        const data = {
            apiVersion: 'v1',
            kind: 'context',
            metadata: {
                name: argv.name,
            },
            spec: {
                type: 'helm-repository',
                data: {
                    repositoryUrl: bucket,
                    variables: {
                        [AWS.keyId.awsEnvVar]: argv[AWS.keyId.cliFlag],
                        [AWS.secretKey.awsEnvVar]: argv[AWS.secretKey.cliFlag],
                        [AWS.region.awsEnvVar]: argv[AWS.region.cliFlag],
                    },
                },
            },
        };

        if (!data.metadata.name || !data.spec.type) {
            throw new CFError('Name and type must be provided');
        }
        
        await context.createContext(data);
        console.log(`Context: ${data.metadata.name} created`);
    },
});

module.exports = command;

