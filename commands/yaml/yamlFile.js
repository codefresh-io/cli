const YAML  = require('json2yaml')
const debug = require('debug')('yaml file creator')
const _     = require('lodash');
function Yamlfile(){
  this.model = _.clone(modelTemplate);
}
const modelTemplate = {
  version: '1.0',
  steps : []
}
const buildStep = {
  type: "build",
  "fail-fast": false,
  dockerfile: "Dockerfile",
  "image-name": "owner/imageName",
  tag : "latest"
}

Yamlfile.prototype.create = function(type , callback){

   return this.done(callback);
}

Yamlfile.prototype.reset = function(){
  this.model = _.clone(modelTemplate);
}

Yamlfile.prototype.addStep = function(name, data, callback){
    debug(`${name} , ${data}`);

    var step = {}

    if ( data.type === "build"){
      let step  = _.clone(buildStep);
       data = _.merge(data , step)
    }

  step [name]  = data;
  this.model.steps.push(step);
  callback(null, data);
}

Yamlfile.prototype.done = function(callback){

  yamlText = YAML.stringify(this.model);
  debug(`yaml is : ${yamlText}`);
  callback(null, yamlText);

}

Yamlfile.prototype.save = function(dir, callback){
  _.defaults(dir, ".");

  var path = require('path');
  var fs   = require('fs');
  var yaml = path.resolve(dir, './codefresh.yaml');
  debug(`saving file ${yaml}`);
  yamlText = YAML.stringify(this.model);
  fs.writeFile(yaml, yamlText, callback);
}


module.exports = Yamlfile;
