const context = require('../index'); // eslint-disable-line
const authManager = require('./manager');
const {whoami} = require('./whoami');
const defaults = require('../../defaults');


describe('whoami tests', () => {
     beforeEach(()=>{
       authManager.loadContexts(defaults.CFCONFIG);

     })
     it('show account per context', async ()=>{
        let iam = await whoami();
        console.log(iam);
     })
});
