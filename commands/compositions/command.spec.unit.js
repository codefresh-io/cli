"use strict";

var assert = require('assert');
var debug       = require('debug')('connector.spec');
var request     = require('superagent-use');
var prettyjson  = require('prettyjson');
var path        = require('path');
var Command     = require('./command');
var _           = require('lodash');


describe('compositions test', ()=>{
  var login ;
  var url;
  var args = {"accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTJlOTQyMjM4MjQ4MzFkMDBiMWNhM2UiLCJhY2NvdW50SWQiOiI1NjcyZDhkZWI2NzI0YjZlMzU5YWRmNjIiLCJpYXQiOjE0NzAyNTkyNDUsImV4cCI6MTQ3Mjg1MTI0NX0.Sm1nKCDzkFkuLHRaAg4o8bLsYATOOrRzDHZRtKylJoI"}
  var command = new Command({accessToken : args.accessToken,  url:'https://g.codefresh.io'});

   before((done)=>{
     console.log('test setup');

     var Login = require('../login/connector');
     url =  'https://g-staging.codefresh.io';

     done();
   })

   it('get compositions', (done)=>{
     //https://g-staging.codefresh.io/api/builds/?limit=10&page=1&repoOwner=testingGal&repoName=lets-chat&type=webhook

            command.get().then(function(res){
            debug('request completed')


            console.log('----------------------------------------');
            console.log(prettyjson.render(res));
            console.log('----------------------------------------');
            debug('new token created');

            return;

        }).then(done , done);
      })

  it('create new composition', (done)=>{
        //https://g-staging.codefresh.io/api/builds/?limit=10&page=1&repoOwner=testingGal&repoName=lets-chat&type=webhook
           var data = {
            "isAdvanced": false,
            "vars": [],
            "name": "oleg_test_compose1"
          }

          var file = path.resolve(__dirname, './test/docker-compose.yaml');

          command.readYaml(file).then((yaml)=>{

            _.set(data, 'yamlJson', yaml);
            console.log('DATA:' + JSON.stringify(data));
            console.log('YAML' + yaml);


            return data;
          }).then(command.create.bind(command)).then(function(res){
          debug('request completed')


          console.log('----------------------------------------');
          console.log(prettyjson.render(res));
          console.log('----------------------------------------');
          debug('new token created');

          return;

      }).then(done , done);
  })



   })
