'use strict';


var Promise     = require("bluebird");
var assert      = require('assert');
var _           = require('lodash');
var promisify   = require("promisify-es6");
var Q           = require('q');

describe('codefresh yaml spec', ()=>{

    const YAML = require('./yamlFile');
    assert(YAML);

    var Yaml;
    beforeEach(()=>{
        console.log('before each');
        Yaml = new YAML();
    });


    it('create codefresh.yaml', (done)=>{
        var createYaml =  promisify(Yaml.create.bind(Yaml));
        createYaml({}).then((result)=>{
            console.log(result);
            done();
        }, (err)=>{
            done(err);
        }).catch((e)=> {
            done(e);
        });
    });


    it('add run step ', (done)=>{
        var createYaml = promisify(Yaml.create.bind(Yaml));
        var addStep = Yaml.addStep.bind(Yaml);
        console.log('Run Step has started');
        Q(addStep.bind("run-step", {image: "node", "fail-step":true})).then((result)=>{
            console.log(result);
            console.log('runStep ->step added');
        }, (err)=>{
            console.log('error:'  + err);

        }).then(createYaml).catch((e)=> {
            console.log('exception occured');
            throw e;
        }).done(()=>{

            return done();
        } , done);
    });

    it('add build step ', (done)=>{
        var createYaml = promisify(Yaml.create.bind(Yaml));
        var addStep = Yaml.addStep.bind(Yaml);
        console.log('Build Step has started');
        Q(addStep.bind("build-step", {type:"build", image: "node", "fail-step":true, dockerfile : "./Dockerfile"})).then((result)=>{
            console.log('added step , about to create  yaml');
            console.log(result);

        }, (err)=>{
            console.log('error:'  + err);
            done();
        }).then(createYaml).catch((e)=> {

            throw e;

        }).done(()=>{done();} , done);
    });

    it('save yaml ', (done)=>{
        function save(){
            var p = new Promise((resolve , reject)=>{
                var callback = (err, data)=>{

                    if (err)
                        return reject(err);

                    resolve(data);
                };



                var saveArgs = [];
                if (arguments.length>2)
                    throw 'incorrect number of arguments ' + arguments.length;
                switch(arguments.length){
                    case 0 :
                        saveArgs.push(null);
                        saveArgs.push(null);
                        break;
                    case 1:
                        saveArgs.push(null);
                        break;

                }
                _.forEach(arguments, (arg)=>{
                    saveArgs.push(arg);
                });

                saveArgs.push(callback);
                Yaml.save.apply(Yaml, saveArgs);
            });
            return p;
        }

        save(__dirname, "codefresh_test.yml").then((result)=>{
            console.log(result);

        }, (err)=>{
            console.log('error:'  + err);

        }).catch((e)=> {
            throw e;
        }).done(()=>{done();} , done);
    });


    it('add stack', (done) => {
        var save = promisify(Yaml.save.bind(Yaml));
        var addStack =  Yaml.addStack.bind(Yaml);

        var Stacks = require('./stacks');
        var stacks = Stacks.stacks;
        console.log("size:" + stacks.length);
        assert(stacks[0]);
        assert(stacks[0].steps);
        console.log(`stack is ${JSON.stringify(stacks[0])}`);
        console.log(`stack steps are ${JSON.stringify(stacks[0].steps)}`);
        console.log(`save/n ${save} ----/n`);

        var Q = require('q');
        var defer = Q.defer();

        addStack(stacks[0],(err)=>{
            if (err)
                return defer.reject(err);
            console.log('stack added');
            console.log(`model : ${JSON.stringify(Yaml.model)}`);
            Yaml.upTodate = true;
            return defer.resolve({a:1});
        });

        defer.promise.then(
            (data)=>{
                console.log(`after add->stack ${data}`);
                return save(__dirname, "codefresh_test.yaml");
            }).then(function test(){
            console.log('after then');
            var util = require('util');
            console.log('ARGS' + util.format('%j %j', arguments[0], arguments[1]));

        }).catch((e)=>{
            console.log('exception : ' + e);
            throw e;
        }).done(()=>{done();} , done);

        return ;

    });


});
