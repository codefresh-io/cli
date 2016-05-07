var assert = require('assert');

describe('cli test', ()=>{
    it('test login', (done)=>{
        var login = require('../commands/login');
        console.log(`${login.command}`);
        assert(login.command);
        done();
    })
})
