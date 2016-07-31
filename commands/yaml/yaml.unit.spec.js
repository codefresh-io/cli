'use strict';


var Promise = require("bluebird");
var assert  = require('assert');

describe('codefresh yaml spec', ()=>{

  const YAML = require('./yamlFile');
  assert(YAML);

  var Yaml;
  beforeEach(()=>{
      console.log('before each');
      Yaml = new YAML();
  })


 it('create codefresh.yaml', (done)=>{
      var createYaml = Promise.promisify(Yaml.create.bind(Yaml));
      createYaml({}).then((result)=>{
        console.log(result);
        done();
     }, (err)=>{
       done(err)
     }).catch((e)=> {
       done(e);})
 });


 it('add run step ', (done)=>{
     var createYaml = Promise.promisify(Yaml.create.bind(Yaml));
     var addStep = Promise.promisify(Yaml.addStep.bind(Yaml));

     addStep("mystep", {image: "node", "fail-step":true}).then((result)=>{
       console.log(result);

    }, (err)=>{
      console.log('error:'  + err);

    }).then(createYaml).catch((e)=> {
      throw e}).done(()=>{done();} , done);
});

it('add buld step ', (done)=>{
    var createYaml = Promise.promisify(Yaml.create.bind(Yaml));
    var addStep = Promise.promisify(Yaml.addStep.bind(Yaml));

    addStep("build-step", {type:"build", image: "node", "fail-step":true, dockerfile : "./Dockerfile"}).then((result)=>{
      console.log(result);

   }, (err)=>{
     console.log('error:'  + err);

   }).then(createYaml).catch((e)=> {
     throw e}).done(()=>{done();} , done);
});

it('save yaml ', (done)=>{
    var save = Promise.promisify(Yaml.save.bind(Yaml));

    save().then((result)=>{
      console.log(result);

   }, (err)=>{
     console.log('error:'  + err);

   }).catch((e)=> {
     throw e}).done(()=>{done();} , done);
});


it.only('add stack', (done)=>{


  //  origin(()=>{console.log('callback!');done();});
  //  return
    var save = Yaml.save;
    var addStack =  Yaml.addStack.bind(Yaml);


    var Stacks = require('./stacks');
    var stacks = Stacks.stacks;
    assert(stacks[0]);
    assert(stacks[0].steps);
    console.log(`stack is ${JSON.stringify(stacks[0])}`);
    console.log(`stack steps are ${JSON.stringify(stacks[0].steps)}`);
    console.log(`save/n ${save} ----/n`);

    var Q = require('q');
    var defer = Q.defer();

    addStack(stacks[0],(err, data)=>{
      if (err)
       return defer.reject(err);
       console.log('stack added')
       console.log(`model : ${JSON.stringify(Yaml.model)}`);
       Yaml.upTodate = true;
      return defer.resolve({a:1});
    })

    defer.promise.then(save.bind(Yaml, __dirname)).then(function test(){
      console.log('after then');
      var util = require('util');
      console.log('ARGS' + util.format('%j %j', arguments[0], arguments[1]));

    }).catch((e)=>{
      console.log('exception : ' + e);
      throw e;
    }).done(()=>{done();} , done);

    return ;

});


})
