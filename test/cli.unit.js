var assert = require('assert');

describe('cli test', ()=>{
    it('test login', (done)=>{
        var login = require('../commands/login');
        console.log(`${login.command}`);
        assert(login.command);
        done();
    });

    it.only('test options', (done)=>{
      var argv = require('yargs-parser')(process.argv.slice(2),{default: {'url': 'http://oleg'}});
      console.log(argv);
      assert.equal(argv.url, "http://oleg");
      done();
    });

});
