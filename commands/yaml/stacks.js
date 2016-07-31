'use strict';
var _ = require('lodash');
var assert = require('assert');
var debug  = require('debug')('stacks');

var stacks = [
  {
    name : 'nodejs',
    steps : [
      {
          "name" :  "build-step",
          "type": "build",
          "fail-fast": "false",
          "dockerfile": "Dockerfile",
          "image-name": "owner/imageName",
          "tag" : "latest"

      } ,

      {
          "name" :  "test-step",
          "fail-fast": "false",
          "image": "node:latest",
          "commands":
          [  "npm install -g better-npm-run" ,
             "npm install -g mocha" ,
             "npm install" ,
             "npm test"
          ]

       } ,
     ]
  }
];

function Stacks(){
  this.stacks = stacks;
}

Stacks.prototype.getStack = function(name){
  var stack;
  _.forEach(stacks, (s)=>{
    debug(`checking for ${name} in stack ${JSON.stringify(s)}`);
    if (s.name === name)
      stack = s;
  })

  debug(`stack detected ${JSON.stringify(stack)}`);
  assert(stack);
  return stack;
}
module.exports = new Stacks();
