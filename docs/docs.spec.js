const docs = require('../docs');

describe('docs generation', () => {
    jest.setTimeout(60000);
    it('should generate docs', async () => {
        return await docs();
    });
});
