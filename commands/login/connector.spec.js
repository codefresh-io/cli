var Login = require('./login');
var assert = require('assert');
assert(Login);
console.log('login of');
console.log(process.args);

describe('login', function(){
   var url = 'https://g-staging.codefresh.io'
   var login;
   beforeEach ((done)=>{
      login = new Login('verchol', 'oleg1314', url);
      login.connect().then(function(){
         assert(login.token);
         done();
      }, done);
   });

   it('login to code', function(done){
     done();
   })

   it.only('get user info', function(done){
       login.getUserInfo().then((info)=>{
         assert(info);
         done();
       }, done);
   });

})
