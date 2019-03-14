const docs = require('../docs');

describe('docs generation', () => {
    jest.setTimeout(10000);
    it('should generate docs', async () => {
        await docs();
    });
});
