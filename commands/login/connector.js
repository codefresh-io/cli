//var assert    = require('assert');
var util      = require('util');
var debug     = require('debug')('cli-login');
var _         = require('lodash');
var request   = require('superagent-use');
var jsonfile  = require('jsonfile');
var path      = require('path');

var ACCESS_TOKEN_DEFAULT = path.resolve(process.env.HOME,'.codefresh/accessToken.json');

var persistToken = function(token, tokenFile){
    debug(`persistToken ${token} into ${tokenFile}`);
    var fs = require('fs');
    var p = new Promise((resolve, reject)=>{
        fs.writeFile(tokenFile ,JSON.stringify({accessToken:token}),(err) => {

            if (err)
            {
                debug(`error: ${err}`);

                return reject(err);
            }
            console.log('It\'s saved!');
            resolve(token);
        });

    });

    return p;
};

function Login(url, params) {
    //{url: url, token :token,  tokenFile : accessTokenFile)
    this.url  = url;
    this.user = params.user;
    this.pwd = params.pwd;
    var access = {};
    if (!params.access)
        access = {};
     else
        access = params.access;
    _.defaults(access, {file: ACCESS_TOKEN_DEFAULT});
    //assert(access.token); // todo get output 'undefined == true'
    this.accessTokenFile =  access.file;
    this.token = access.token;
    //var self = this;

    debug(`url - ${url}, user - ${params.user}, ${params.pwd}, ${access.file}, ${access.token}`);

    if (this.token)
        persistToken(this.token, this.accessTokenFile);
}

Login.prototype.resetToken = function(){
    //reset file
    throw new Error('not implemented');
};

Login.prototype.connect= function() {
    var self = this;
    var url = util.format('%s/api/auth/local', this.url);
    var accessTokenPromise  = new Promise((resolve ,reject) => {
        debug('in execute function');

        var accessTokenFile = path.resolve(self.accessTokenFile);
        debug(`read from ${self.accessTokenFile}`);

        jsonfile.readFile(accessTokenFile,  (err, obj) =>{
            if (err){
                debug(err + 'rejected accessToken');
                return reject('user not provided and not token found');
            }
            debug('accessToken row ' + JSON.stringify(obj));
            self.token =  obj.accessToken ;
            debug(`AccessToken=${obj.accessToken}`);

            return resolve({token:self.token});
        });
        return;
    })
        .then((data)=>{
            debug('resolved with token' + data.token);
            return data.token;
        }, () =>{
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
                        debug('request completed! ');
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
                });
        });
    return accessTokenPromise;
};

Login.prototype.whoami= function() {
    throw new Error('not implemented');
};

Login.prototype.getUserInfo = function() {
    var self = this;
    var p = new Promise((resolve, reject)=>{
        var url = util.format('%s/api/user', self.url);
        debug(`token: ${self.token}`);
        if (!self.token)
            return reject ('no token provided');

        request
            .get(url)
            .set('X-Access-Token', self.token)
            .set('Accept', 'application/json')
            .end(function(err, res){

                if (err){
                    debug(`requst ended with error: ${err} , ${JSON.stringify(res.body)}`);

                    return reject(err);

                }
                debug(`response is ${JSON.stringify(res.body)}`);

                var profile =  _.get(res.body, 'shortProfile.userName');
                debug(`you logged in is as ${profile}`);
                return resolve(profile);
            });
    });
    return p;
};

module.exports  = Login;
