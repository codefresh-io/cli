var Promise = require("bluebird");
var assert  = require('assert');

describe('codefresh yaml spec', ()=>{
  debugger;
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

    save("").then((result)=>{
      console.log(result);

   }, (err)=>{
     console.log('error:'  + err);

   }).catch((e)=> {
     throw e}).done(()=>{done();} , done);
});


})
