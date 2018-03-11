const { genrateTests } = require('../../cliTest.test');

const tests = [{
    command: 'codefresh get pip --repo-owner codefresh-io --repo-name demochat --name demochat',
    params: {
        label: [],
        output: 'wide',
        limit: 25,
        page: 1,
        'repo-owner': 'codefresh-io',
        'repo-name': 'demochat',
        name: 'demochat',
    },
    apiCalls: [
        {
            url: '/api/pipelines',
            qs: {
                name: 'demochat',
                limit: 25,
                page: 0,
                repoOwner: 'codefresh-io',
                repoName: 'demochat',
            },
            method: 'GET',
        },
    ],
    output: [
        {
            '_id': '59d62fc65e09a90001aefed2',
            'service': '59d62fc65e09a90001aefed0',
            'dockerFilePath': 'Dockerfile',
            'applicationPort': '3000',
            'run': {
                'node': '',
                'nodeParams': '',
                'workDir': '',
                'jsFile': '',
                'params': '',
            },
            'template': {
                'label': 'Node.js',
            },
            'name': 'demochat',
            'imageName': 'codefreshio/demochat',
            'provider': 'github',
            'repoOwner': 'codefresh-io',
            'repoName': 'demochat',
            'account': '59d37837920f8900018a6183',
            'creator': '59d37837920f8900018a6182',
            '__v': 1,
            'registry': null,
            'contexts': [],
            'clusterProvider': {
                'active': false,
            },
            'notifications': [],
            'tests': [],
            'ymlfileLocation': 'codefresh.yml',
            'ymlFileFrom': 'repo',
            'webhookBuildStrategy': 'regular',
            'webhook': false,
            'integ_sh': '',
            'deployment': {
                'deploymentYamlFrom': 'kubeService',
                'deploy_image': '',
                'deploy_type': 'default',
            },
            'deploy_sh': 'if [[ $CF_BRANCH == master ]]; then\n     #install cf command line\n     npm install -g @codefresh-io/cf-cli\n     #authenticate as user TOKEN and USER. User is configured in the environment variables\n     cf-cli login --token $TOKEN -u $USER\n     # cf-cli builds build -a $ACCOUNT -o $REPO_OWNER -r $REPO_NAME\n     cf-cli run codefresh/demochat:master\n     fi',
            'test_sh': '',
            'dockerFileContents': 'FROM node:8.0-alpine AS builder\n\nWORKDIR /app\n\nCOPY package.json /app\n\n# Creating tar of productions dependencies\nRUN npm install --production && cp -rp ./node_modules /tmp/node_modules\n\n# Installing all dependencies\nRUN npm install\n\n# Copying application code\nCOPY . /app\n\n# Running tests\nRUN npm test\n\nFROM node AS runner\n\nEXPOSE 3000\nWORKDIR /app\n\n# Adding production dependencies to image\nCOPY --from=builder /tmp/node_modules /app/node_modules\n\n# Copying application code\nCOPY . /app\n\nCMD npm start',
            'env': [
                {
                    'value': '3000',
                    'key': 'PORT',
                    '_id': '59d62fc652c3760001ee4d25',
                },
                {
                    'key': 'ziv-codefresh',
                    'value': '*****',
                    'encrypted': true,
                    '_id': '59d79e6ffa01f300019b03a2',
                },
            ],
            'workingDirectory': './',
            'useDockerfileFromRepo': true,
            'create': '2017-10-05T13:12:38.163Z',
            'webhookFilter': [
                {
                    '_id': '59d62fc652c3760001ee4d24',
                    'events': {
                        'push': true,
                    },
                    'regex': '/.*/gi',
                    'type': 'default',
                },
            ],
        },
    ],
    outputEntity: [
        {
            'entityType': 'pipeline',
            'info': {
                'id': '59d62fc65e09a90001aefed2',
                'name': 'demochat',
                'imageName': 'codefreshio/demochat',
                'repoOwner': 'codefresh-io',
                'repoName': 'demochat',
            },
            'defaultColumns': [
                'id',
                'name',
                'repoOwner',
                'repoName',
            ],
            'wideColumns': [
                'id',
                'name',
                'repoOwner',
                'repoName',
            ],
        },
    ],
},];

const testSuite =
    [
        {
            describe: 'Get Pipeline Tests',
            target: require('./get.cmd').handler,
            tests: tests,
        },
    ];


genrateTests(testSuite);
