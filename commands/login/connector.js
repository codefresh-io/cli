var util      = require('util');
var debug     = require('debug')('cli-login');
var _         = require('lodash');
var request   = require('request');
var jsonfile  = require('jsonfile');
var path      = require('path');
var User      = require('./user');
var mkdirp    = require('mkdirp');
var Q         = require('q');

var ACCESS_TOKEN_DEFAULT = path.resolve(process.env.HOME,'.codefresh/accessToken.json');

var createCodefreshDir = function () {
    var deferred = Q.defer();
    mkdirp(process.env.HOME +'/.codefresh', function (err) {
        if (err) {
            debug(`error: ${err}`);
            return deferred.reject(err);
        } else deferred.resolve(true);

    });
    return deferred.promise;
};

var persistToken = function(token, tokenFile) {
    debug(`persistToken ${token} into ${tokenFile}`);
    var fs = require('fs');
    var p = new Promise((resolve, reject) => {
        console.log('path_to_codefresh:' + process.env.HOME +'/.codefresh');
        fs.writeFile(tokenFile ,JSON.stringify({accessToken:token}),(err) => {
            if (err) {
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
    this.url  = url;
    this.user = params.user;
    this.pwd = params.pwd;
    var access = {};
    if (!params.access)
        access = {};
    else
        access = params.access;
    _.defaults(access, {file: ACCESS_TOKEN_DEFAULT});
    if(params.token) {
        _.defaults(access, {token: params.token});
    }
    this.accessTokenFile = access.file;
    this.token = access.token;
    debug(`url - ${url}, user - ${params.user}, ${params.pwd}, ${access.file}, ${access.token}`);
}

Login.prototype.resetToken = function() {
    //reset file
    throw new Error('not implemented');
};

Login.prototype.preConditions = function () {
    var deferred = Q.defer();
        createCodefreshDir().then(() => {
            if (this.token) {
                deferred.resolve(persistToken(this.token, this.accessTokenFile));
            } else deferred.resolve(true);
        }, (err) => {
            deferred.reject(err);
        });
    return deferred.promise;
};

Login.prototype.connect = function() {
    var self = this;
    var url = util.format('%s/api/auth/local', this.url);
    var accessTokenPromise  = new Promise((resolve ,reject) => {
        debug('in execute function');

        var accessTokenFile = path.resolve(self.accessTokenFile);
        debug(`read from ${self.accessTokenFile}`);

        jsonfile.readFile(accessTokenFile,  (err, obj) => {
            if (err) {
                debug(err + 'rejected accessToken');
                console.log('user not provided and not token found');
                return reject('user not provided and not token found');
            }
            debug('accessToken row ' + JSON.stringify(obj));
            self.token =  obj.accessToken;
            debug(`AccessToken=${obj.accessToken}`);
            return resolve({token:self.token});
        });
    }).then((data) => {
        debug('resolved with token' + data.token);
        return data.token;
    }, () => {
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
                    if (err) {
                        debug(`error - ${err} , res= ${JSON.stringify(res.body)}`);
                        return reject(new CFError({
                            message: `${JSON.stringify(res.body)}`,
                            cause: err
                        }));
                    }
                    debug('new token created ' + res);
                    self.token = res.body.accessToken;
                    return persistToken(self.token);
                });
        }).catch((err) => {
            debug('UNHANDLED error ' + err);
            throw err;
        });
    });
    return accessTokenPromise;
};

Login.prototype.whoami= function() {
    throw new Error('not implemented');
};

Login.prototype.getUserInfo = function() {
    var self = this;
    var p = new Promise((resolve, reject) => {
        var url = util.format('%s/api/user', self.url);
        debug(`token: ${self.token}`);
        if (!self.token)
            return reject ('no token provided');

        request
            .get(url)
            .set('X-Access-Token', self.token)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                if (err) {
                    debug(`requst ended with error: ${err} , ${JSON.stringify(res.body)}`);
                    return reject(err);
                }
                debug(`response is ${JSON.stringify(res.body)}`);
                var user = new User.User(res.body);
                user.setUrl(self.url);
                debug(`you logged in is as ${user.getUserName()}`);
                return resolve(user);
            });
    });
    return p;
};

module.exports = Login;
