const docs = require('../docs');

describe('docs generation', () => {
    jest.setTimeout(20000);
    it('should generate docs', async () => {
        return await docs();
    });
});
