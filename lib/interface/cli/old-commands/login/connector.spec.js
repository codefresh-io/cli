var Login = require('./connector');
var assert = require('assert');
var debug  = require('debug')('connector.spec');

assert(Login);
console.log('login of');
console.log(process.args);

describe('login', function(){
   var url = 'https://g.codefresh.io';
   var login;
   var token = process.env.CF_TOKEN;

   beforeEach ((done) => {
      login = new Login(url, {access:{token:token}, user : "verchol"});
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
     });

   });

   it.only('get user info', function(done){
       login.connect().then(login.getUserInfo.bind(login)).then((profile)=>{
         assert(profile);
         console.log(`you logged in is as ${profile}`);
         done();
       }, done);
   });

});
