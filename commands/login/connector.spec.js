var Login = require('./connector');
var assert = require('assert');
var debug  = require('debug')('connector.spec');

assert(Login);
console.log('login of');
console.log(process.args);
debugger;

describe('login', function(){
   var url = 'https://g-staging.codefresh.io'
   var login;
   beforeEach ((done)=>{
      login = new Login('verchol', 'oleg1314', url);
      done();

   });

   it.only('login to code', function(done){
     login.connect().then(function(data){
        debug(JSON.stringify(data));
        console.log('token is '  + login.token);
        done();
     }, (err)=>{
       console.log('test failed :' + err);
       return done(err);
     }).catch((err)=>{
       console.log(err);
       done(err);
     })

   })

   it('get user info', function(done){
       login.connect().then(login.getUserInfo.bind(login)).then((info)=>{
         assert(info);
         done();
       }, done);
   });

})
