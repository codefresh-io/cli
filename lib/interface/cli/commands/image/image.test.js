const _ = require('lodash');
const getTraget = require('./get.cmd').handler;
const DEFAULTS = require('../../defaults');
const params = {
    id: 0,
    limit: DEFAULTS.GET_LIMIT_RESULTS,
    all: false,
    label: [],
    tag: [],
    sha: 0,
    'image-name': [],
    branch: [],
    page: DEFAULTS.GET_PAGINATED_PAGE,
};


function getTest(argv = {}) {
    if (!argv.label) {
        argv.label = [];
    }
    return argv;
}

//jest.mock('../../../../logic/api/helper');
jest.mock('../../../../logic/api/helper', () => ({
    sendHttpRequest: jest.fn()
}));

const test1 = {
    command: 'codefresh get pip -o=wide',
    apiCalls: [
        {
            call: {
                url: '/api/pipelines',
                qs: { a: '2', b: '3' },
                method: 'GET',
            },
        },
        {
            url: '/api/pipelines',
            qs: { a: '2', b: '3' },
            method: 'GET',
        },
        {
            url: '/api/pipelines',
            qs: { a: '2', b: '3' },
            method: 'GET',
        },
    ],
    output: [
        { name: 'x', id: 'asd', repoowner: 'repoowner' },
        { name: 'y', id: 'asd', repoowner: 'repoowner' },
    ],
};


const {sendHttpRequest} = require('../../../../logic/api/helper');
sendHttpRequest.mockImplementation(() => [5]);

describe('getImages', () => {
    it('get images test', async () => {
        const getProperties = getTest(params);
        const result = await getTraget(getProperties);
        const calls = sendHttpRequest.mock.calls;

        //check how many time the function has been called
        expect(sendHttpRequest.mock.calls.length).toBe(1);

        //check the order of the endpoints
        const url = calls[0][0].url;
        expect(url).toBe('/api/images');

        //check the parameters
        const qs = calls[0].qs;
        expect(qs).toBe();
    });
});


const genrateTests = testParams => {

};
