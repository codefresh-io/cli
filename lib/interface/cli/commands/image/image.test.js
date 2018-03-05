const _ = require('lodash');
const getTraget = require('./get.cmd').handler;
const helper = require('../../../../logic/api/helper');


function getTest(argv = {}) {
    argv.label = [];
    return argv;
}


describe('getImages', () => {
    it('registers git webhook', async () => {
        helper.sendHttpRequest = jest.fn();
        const getProperties = getTest();
        const result = await getTraget(getProperties);
        expect(helper.sendHttpRequest.mock.calls.length).toBe(1);
    });
});
