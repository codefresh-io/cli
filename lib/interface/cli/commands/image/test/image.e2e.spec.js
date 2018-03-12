const { genrateTests } = require('../../../helpers/generate-e2e');

const tests = [{
    command: 'codefresh get img -o=wide',
    params: {
        label: [],
        output: 'wide',
        limit: 25,
        page: 1,
        tag: [],
        type: '',
        branch: 'master',
        'image-name': '',
        select: 'internalName tags internalImageId created size imageDisplayName metadata',
    },
    apiCalls: [
        {
            url: '/api/images',
            qs: {
                limit: 25,
                offset: 0,
                metadata: {},
                tag: [],
                type: '',
                branch: 'master',
                imageDisplayNameRegex: '',
                select: 'internalName tags internalImageId created size imageDisplayName metadata',
            },
            method: 'GET',
        },
    ],
    output: {
        docs: [
            {
                '_id': '83c85ce66455f875a557f8ffbd79d7a9fd32e101',
                'internalName': 'r.cfcr.io/zivcodefresh/zivcodefresh/npmtest@sha256:c279fcb8414f087afb4475c889a8603e7ee37dfa14eaf27b0b546754f4544abd',
                'size': 716274818,
                'internalImageId': 'd301f5d91e668603f0f8fbe72fad34dc2b156151e9aa2673c93377e2576285eb',
                'imageDisplayName': 'zivcodefresh/npmtest',
                'created': '2017-12-10T10:15:27.982Z',
                'tags': [
                    {
                        'registry': 'r.cfcr.io',
                        'repository': 'zivcodefresh/zivcodefresh/npmtest',
                        'tag': 'master',
                        'created': '2017-12-10T10:15:52.398Z',
                        'user': '59d37837920f8900018a6182',
                        'type': 'promote',
                        '_id': '5a2d09584aece900014b7746',
                    },
                ],
            },
        ],
    },
    outputEntity: [
        {
            'entityType': 'image',
            'info': {
                'name': 'zivcodefresh/npmtest',
                'size': '683.09 MB',
                '_id': '83c85ce66455f875a557f8ffbd79d7a9fd32e101',
                'annotations': {},
                'tagId': '5a2d09584aece900014b7746',
                'id': 'd301f5d91e66',
                'tag': 'master',
                'pull': 'r.cfcr.io/zivcodefresh/zivcodefresh/npmtest:master',
                'created': '3 months ago',
            },
            'defaultColumns': [
                'id',
                'name',
                'tag',
                'created',
                'size',
                'pull',
            ],
            'wideColumns': [
                'id',
                'name',
                'tag',
                'created',
                'size',
                'pull',
            ],
        },
    ],
}, {
    command: 'codefresh get img -o=wide',
    params: {
        label: [],
        output: 'wide',
        limit: 25,
        page: 1,
        tag: [],
        type: '',
        branch: 'master',
        'image-name': '',
        select: 'internalName tags internalImageId created size imageDisplayName metadata',
    },
    apiCalls: [
        {
            url: '/api/images',
            qs: {
                limit: 25,
                offset: 0,
                metadata: {},
                tag: [],
                type: '',
                branch: 'master',
                imageDisplayNameRegex: '',
                select: 'internalName tags internalImageId created size imageDisplayName metadata',
            },
            method: 'GET',
        },
    ],
    output: {
        docs: [
            {
                '_id': '83c85ce66455f875a557f8ffbd79d7a9fd32e101',
                'internalName': 'r.cfcr.io/zivcodefresh/zivcodefresh/npmtest@sha256:c279fcb8414f087afb4475c889a8603e7ee37dfa14eaf27b0b546754f4544abd',
                'size': 716274818,
                'internalImageId': 'd301f5d91e668603f0f8fbe72fad34dc2b156151e9aa2673c93377e2576285eb',
                'imageDisplayName': 'zivcodefresh/npmtest',
                'created': '2017-12-10T10:15:27.982Z',
                'tags': [
                    {
                        'registry': 'r.cfcr.io',
                        'repository': 'zivcodefresh/zivcodefresh/npmtest',
                        'tag': 'master',
                        'created': '2017-12-10T10:15:52.398Z',
                        'user': '59d37837920f8900018a6182',
                        'type': 'promote',
                        '_id': '5a2d09584aece900014b7746',
                    },
                ],
            },
        ]},
    outputEntity: [
        {
            'entityType': 'image',
            'info': {
                'name': 'zivcodefresh/npmtest',
                'size': '683.09 MB',
                '_id': '83c85ce66455f875a557f8ffbd79d7a9fd32e101',
                'annotations': {},
                'tagId': '5a2d09584aece900014b7746',
                'id': 'd301f5d91e66',
                'tag': 'master',
                'pull': 'r.cfcr.io/zivcodefresh/zivcodefresh/npmtest:master',
                'created': '3 months ago',
            },
            'defaultColumns': [
                'id',
                'name',
                'tag',
                'created',
                'size',
                'pull',
            ],
            'wideColumns': [
                'id',
                'name',
                'tag',
                'created',
                'size',
                'pull',
            ],
        },
    ],
},];

const testSuite =
    [
        {
            describe: 'Get Images Tests',
            target: require('../get.cmd').handler,
            tests: tests,
        },
    ];


genrateTests(testSuite);
