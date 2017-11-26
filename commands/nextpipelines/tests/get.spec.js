"use strict";
const commands  = require('../command');
const chai      = require("chai");
const expect    = chai.expect;
chai.use(require('chai-as-promised'));
const proxyquire = require('proxyquire').noCallThru();
const CFError     = require('cf-errors');

describe('new gen pipelines get test', () => {

    describe('getPipelines test', function() {

        describe('postive', function() {

            it('Should pass and return the name of the context', () => {
                var info = {
                    url: 'https://g.codefresh.io',
                    file : '/Users/codefresh/WebstormProjects/untitled2/f.yaml', //change for dynamic path
                    token: process.env.CF_TOKEN,
                };


                const commandsProxy = proxyquire('../command.js', {
                    'request': {
                        get: ({}, callback) => {
                            callback(null,null,"context1")
                        }
                    }
                });

                return commandsProxy.getPipelines(info).then((res)=> {
                    expect(res).to.deep.equal("context1")
                });
            });
        });


        describe('negative', function() {
            it('Should failed and return an error', () => {
                var info = {
                    url: 'https://g.codefresh.io',
                    file : '/Users/codefresh/WebstormProjects/untitled2/f.yaml', //change for dynamic path
                    token: process.env.CF_TOKEN,
                };
                const commandsProxy = proxyquire('../command.js', {
                    'request': {
                        get: ({}, callback) => {
                            callback(new CFError('fail get request'),null,null)
                        }
                    }
                });

                return commandsProxy.getPipelines(info)
                    .catch((err)=>{
                        expect(err.message).to.contain('fail get request');
                    })
            });
        });
    });
});


