const docs = require('../docs');

describe('docs generation', () => {
    it('should generate docs', async () => {
        await docs();
    });
});
