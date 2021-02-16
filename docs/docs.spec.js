const docs = require('../docs');
jest.mock('request-promise');
describe('docs generation', () => {
    jest.setTimeout(20000);
    it('should generate docs', async () => {
        return await docs();
    });
});
