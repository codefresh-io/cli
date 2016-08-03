var Login = require('./connector');
var assert = require('assert');
var debug  = require('debug')('connector.spec');

assert(Login);
console.log('login of');
console.log(process.args);
debugger;

describe('login', function(){
   var url = 'https://g.codefresh.io'
   var login;
   var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzI4YjZhYmM3ZjBkMDA2MDA3NzY1MzIiLCJhY2NvdW50SWQiOiI1NzBhMjE0ZWEwOGUyODA2MDA1ODUxZDIiLCJpYXQiOjE0NzAyMjk1MTUsImV4cCI6MTQ3MjgyMTUxNX0.jnJMWiSe-XdBowgHK3T_JNlm7RIPlEIoP5XR_scpjgE";
   beforeEach ((done)=>{
      login = new Login('verchol', 'oleg1314', url, {token:token});
      done();

   });

   it('login to code', function(done){
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

   it.only('get user info', function(done){
       login.connect().then(login.getUserInfo.bind(login)).then((info)=>{
         assert(info);
         done();
       }, done);
   });

})
