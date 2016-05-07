var assert = require('assert');
var util   = require('util');
var debug  = require('debug')('cli-login');
var _      = require('lodash');

function Login(user, pwd, url){

  this.url  = url;
  this.user = user;
  this.pwd = pwd;
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


Login.prototype.connect= function(){
  var request = require('superagent');
  var self = this;
  var p = new Promise((resolve, reject)=>{
  var url = util.format('%s/api/auth/local', this.url);

  request
  .post(url)
  .send({ userName: this.user, password: this.pwd})
  //.set('X-API-Key', 'foobar')
  .set('Accept', 'application/json')
  .end(function(err, res){



   if (err){
        return reject(err);
      }
      self.token = res.body.accessToken;

      return persistToken(self.token).then(resolve , reject);
  });
});

return p;
}

Login.prototype.whoami= function(){
  throw new Error('not implemented');
}

Login.prototype.getUserInfo = function(){

  var request = require('superagent');
  var self = this;
  var p = new Promise((resolve, reject)=>{
  var url = util.format('%s/api/user', this.url);
  debug(`token: ${self.token}`);

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
