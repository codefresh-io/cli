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
  this.accessTokenFile = accessTokenFile;
  var self = this;

  debug(`${url},${user},${pwd}`);
}

var persistToken = function(token){

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
  var accessTokenPromise  = new Promise((resolve ,reject)=>{
    if (!self.user){
      //check if token exist

      jsonfile.readFile(self.accessTokenFile, (err, obj) =>{
        if (err)
          return reject('user not provided and not token found')
         self.token = obj.accessToken;
         debug(`AccessToken=${obj.accessToken}`);
         assert(self.token);
         return resolve({token:self.token})
      })
      return;
    }
    return resolve({});
  })
 .then((data) =>{

  if (data.token)
    return data.token;

  request
  .post(url)
  .send({ userName: self.user, password: self.pwd})
  .on('request', function(req) {
   console.log(req.url); // => https://api.example.com/auth
 })
  //.set('X-API-Key', 'foobar')
  .set('Accept', 'application/json')
  .end(function(err, res){

      if (err){
        debug(res.body);
        return reject(err);
      }
      self.token = res.body.accessToken;
      return persistToken(self.token);
  });
});

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
  return reject ('not token provided');

  request
  .get(url)
  .set('X-Access-Token', this.token)
  .set('Accept', 'application/json')
  .end(function(err, res){
    debug(`requst ended erro: ${JSON.stringify(res.body)}`);
    if (err){
     debug(res);
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
