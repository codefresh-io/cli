'use strict';
var _ = require('lodash');
var debug  = require('debug')('stacks');
var stacks = [];

function Stacks() {
    stacks.push(require('./Stacks/go').get());
    stacks.push(require('./Stacks/scala').get());
    stacks.push(require('./Stacks/ruby').get());
    stacks.push(require('./Stacks/node').get());
    this.stacks = stacks;
}

Stacks.prototype.getStack = function(name) {
    var stack;
    console.log('updated stacks ' + JSON.stringify(stacks));
    _.forEach(stacks, (s) => {
        debug(`checking for ${name} in stack ${JSON.stringify(s)} sname=${s.name}`);
        if (s.name === name) {
            stack = s;
        }
    });

    debug(`stack detected ${JSON.stringify(stack)}`);
    return stack;
};

module.exports = new Stacks();
