'use strict';

var debug     = require('debug')('cli-builds');
var _         = require('lodash');
var request   = require('superagent-use')
var prettyjson = require('prettyjson');

var getBuilds;
module.exports = function(info){

  let buildUrl =  `${info.url}/api/builds?limit=10&page=1&account=${info.account}&repoOwner=${info.repoOwner}&repoName=${info.repoName}&type=webhook`;
  debug('buildUrl:' + buildUrl);


return (token) =>{
   debug('running get builds on url : ' + buildUrl);
   var p = new Promise((resolve, reject)=>{
    request
    .get(buildUrl)
    .on('request', function(req) {
     console.log('trying to connect to '  + req.url); // => https://api.example.com/auth
   })
    //.set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .set('X-Access-Token', token)
    .end(function(err, res){
        debug('request completed')

        if (err){
          debug(res);
          console.log('error:'  + err);
          return reject(err);
        }

        console.log(prettyjson.render(res.body));

        resolve(res.body);
    });
  }).catch((err)=>{
    throw err;
  })
  return p;
}
}
