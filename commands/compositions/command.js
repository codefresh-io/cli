'use strict';

var debug     = require('debug')('compose-command');
var _         = require('lodash');
var request   = require('superagent-use')
var prettyjson = require('prettyjson');
var Q          = require('q')
var fs         = require('fs');
var assert     = require('assert');


const CompositionModel =  {
          "isAdvanced": undefined, //booleadn
          "vars": undefined, //array
          "name": undefined, //string
          "yamlJson" : undefined
}

function Composition(info){
  this.url = `${info.url}/api/compositions`;
  this.token = info.accessToken;

  debug(`url = ${this.url} token = ${this.token}`);
}

Composition.prototype.run = function(argv){
   if (argv.add){
    debug(`adding new composition with name ${argv.name}`);
    return this.readYaml(argv.file).then((yaml)=>{
      debug('creating create composition model');
        return {
          name : argv.name,
          yamlJson : yaml
        }
    }).then(this.create.bind(this));
  }

   return Q.reject(`not supported flag ${JSON.stringify(argv)}`);
}
Composition.prototype.get = function(){

   debug(`get composition on url : ${this.url}`);

   var p = new Promise((resolve, reject)=>{
    request
    .get(this.url)
    .on('request', function(req) {
     console.log('trying to connect to '  + req.url); // => https://api.example.com/auth
   })
    //.set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .set('X-Access-Token', this.token)
    .end(function(err, res){
        debug('request completed')

        if (err){
          debug(res);
          console.log('error:'  + err);
          return reject(err);
        }



        resolve(res.body);
    });
  }).catch((err)=>{
    console.error(`error occured ${err}`);
    throw err;
  })
  return p;
}

Composition.prototype.readYaml = function(composeFile){

  var self = this;

  return Q.nfcall(fs.readFile.bind(fs), composeFile).then((data)=>{
    self.yamlFile = data;
    var b = new Buffer(data);
    return b.toString();
  }, (err)=>{
    throw new Error(err);
  })
}

Composition.prototype.create = function(data){
   //_.defaults(data, 'data.yaml', "./docker-compose.yaml");

   debug(`creaate composition on url : ${this.url} with data ${JSON.stringify(data)}`);


   var model = _.clone(CompositionModel);

   _.set(data, 'name', data.name);
   _.set(data, 'isAdvanced', data.isAdvanced);
   _.set(data, 'vars', data.vars);
   _.set(data, "yamlJson", data.yaml);

    assert(data.name);



   var p = new Promise((resolve, reject)=>{
    request
    .post(this.url)
    .send(data)
    .on('request', function(req) {
     console.log('trying to connect to '  + req.url); // => https://api.example.com/auth
   })
    //.set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .set('X-Access-Token', this.token)
    .end(function(err, res){
        debug('request completed')

        if (err){
          debug(res);
          console.log('error:'  + err);
          return reject(err);
        }

        resolve(res.body);
    });
  }).catch((err)=>{
    console.error(`error occured ${err}`);
    throw err;
  })
  return p;
}

module.exports = Composition;
