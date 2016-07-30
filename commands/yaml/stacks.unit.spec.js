var assert = require('assert');


describe('cf avaiable stacks', ()=>{
  beforeEach(()=>{
    stacks = require('./stacks');
  })
  it('nodejs stack', ()=>{
     assert.equal(stacks[0].name, "nodejs");
     console.log(`stack ${JSON.stringify(stacks[0])}`);
  })
})
