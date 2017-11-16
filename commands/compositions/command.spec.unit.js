"use strict";

var assert = require('assert');
var debug       = require('debug')('connector.spec');
var prettyjson  = require('prettyjson');
var path        = require('path');
var Command     = require('./command');
var _           = require('lodash');

describe('compositions test', () => {
    var url;
    var args = {"accessToken": process.env.CF_TOKEN};
    var command = new Command({accessToken : args.accessToken,  url:'https://g.codefresh.io'});

    before((done)=>{
        console.log('test setup');
        require('../login/connector');
        url =  'https://g-staging.codefresh.io';
        done();
    });

    it('get compositions', (done)=>{
        command.get().then(function(res){
            debug('request completed');
            console.log('----------------------------------------');
            console.log(prettyjson.render(res));
            console.log('----------------------------------------');
            debug('new token created');
            return;
        }).then(done , done);
    });

    it('create new composition', (done)=>{
        var data = {
            "isAdvanced": false,
            "vars": [],
            "name": "oleg_test_compose1"
        };

        assert(data.name);
        var file = path.resolve(__dirname, './test/docker-compose.yaml');
        command.readYaml(file).then((yaml)=>{
            _.set(data, 'yaml', yaml);
            console.log('DATA:' + JSON.stringify(data));
            console.log('YAML' + yaml);
            return data;
        }).then(command.create.bind(command)).then(function(res){
            debug('request completed');
            console.log('----------------------------------------');
            console.log(prettyjson.render(res));
            console.log('----------------------------------------');
            debug('new token created');
            return;
        }).then(done , done);
    });
    it('read FromYaml tests', (done)=>{
        var compose = path.resolve(__dirname , './test/docker-compose.yaml');
        command.readYaml(compose).then((content)=>{
            var yaml = require('js-yaml');
            assert(content);
            console.log(`${JSON.stringify(content)}`);
            var doc = yaml.safeLoad(content);
            console.log(doc);
            assert.equal(doc.version, 2);
            assert.equal(_.get(doc, 'services.cfrouter.build'), '../cf-router');
        }).done(done , done);
    });

    it.only('create composition from file', (done)=>{

        var argv =  {"_":["composition"],"h":false,
            "help":false,"add": true, "file":"/Users/verchol/dev/mainProduct/cf-cli/commands/compositions/test/docker-compose.yaml",
            "f":"/Users/verchol/dev/mainProduct/cf-cli/commands/compositions/test/docker-compose.yaml",
            "tokenFile":"/Users/verchol/.codefresh/accessToken.json",
            "loglevel":"error","log":"error","$0":"index.js", "url":"https://g.codefresh.io"};
        debug(`arguments are ${JSON.stringify(argv)}`);
        argv.name =  "oleg1.1.8";
        var command = new Command({accessToken : args.accessToken,  url:argv.url});
        command.run(argv).then(()=>{
            console.log('action completed');
        }, (err)=>{
            console.log(`action failed with error ${err}`);
            throw err;
        }).done(done, done);
    });

    it('test ', ()=>{
        var a =  {};
        _.set(a, "status", "works");
        console.log(JSON.stringify(a));
        assert.equal(a.status, "works");
    });

});