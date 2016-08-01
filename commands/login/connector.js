var assert    = require('assert');
var util      = require('util');
var debug     = require('debug')('cli-login');
var _         = require('lodash');
var request   = require('superagent-use');
var jsonfile  = require('jsonfile');

function Login(user, pwd, url, accessTokenFile){

  this.url  = url;
  this.user = user;
  this.pwd = pwd;
  this.accessTokenFile = accessTokenFile || 'accessToken.json';
  var self = this;

  debug(`${url},${user},${pwd},${accessTokenFile}`);
}

var persistToken = function(token){
  debug('persistToken ' + token);
  var fs = require('fs');
  var p = new Promise((resolve, reject)=>{
  fs.writeFile('accessToken.json',JSON.stringify({accessToken:token}),(err) => {

  if (err) reject(err);
    console.log('It\'s saved!');
  resolve(token);
});

});

return p;
}

Login.prototype.resetToken = function(){
  //reset file
  throw new Error('not implemented');
}
Login.prototype.connect= function(){


  var self = this;
  var url = util.format('%s/api/auth/local', this.url);
  var accessTokenPromise  = new Promise((resolve ,reject, progress)=>{
    debug('in execute function');


      jsonfile.readFile(self.accessTokenFile, (err, obj) =>{
        if (err){
           debug(err + 'rejected accessToken');
           return reject('user not provided and not token found')
        }
         debug('accessToken row ' + JSON.stringify(obj));
         self.token =  obj.accessToken ;
         debug(`AccessToken=${obj.accessToken}`);
         assert(self.token);
         return resolve({token:self.token})
      })
      return;
  })
 .then((data)=>{
      debug('resolved with token' + data.token);
      return data.token;
 }, (data) =>{
   debug('no token detected, trying to login with user / password');
  return new Promise ((resolve, reject) => {

   request
  .post(url)
  .send({ userName: self.user, password: self.pwd})
  .on('request', function(req) {
   console.log('trying to connect to '  + req.url); // => https://api.example.com/auth
   return req;
   })
  //.set('X-API-Key', 'foobar')
  .set('Accept', 'application/json')
  .end(function(err, res){
      debug('request completed! ')
      if (err){

        debug(`error - ${err} , res= ${JSON.stringify(res.body)}`);
        return reject(err);
      }
      debug('new token created ' + res);
      self.token = res.body.accessToken;

      return persistToken(self.token);
  });
}).catch((err)=>{
  debug('UNHANDLED error ' + err);
  throw err;
  //   throw err;
})
});
assert(accessTokenPromise );

return accessTokenPromise;
}

Login.prototype.whoami= function(){
  throw new Error('not implemented');
}

Login.prototype.getUserInfo = function(){


  var self = this;
  var p = new Promise((resolve, reject)=>{
  var url = util.format('%s/api/user', this.url);
  debug(`token: ${self.token}`);
  if (!self.token)
  return reject ('no token provided');

  request
  .get(url)
  .set('X-Access-Token', this.token)
  .set('Accept', 'application/json')
  .end(function(err, res){

    if (err){
        debug(`requst ended with error: ${err} , ${JSON.stringify(res.body)}`);

    return reject(err);

   }
    debug('user profile is :');
    var profile =  _.get(res.body, ['user_data'])
    debug(profile);
    return resolve(profile);
  });
 })

  return p;
}

module.exports  = Login;
