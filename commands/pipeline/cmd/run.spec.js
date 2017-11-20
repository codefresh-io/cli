"use strict";
var chai = require("chai");
const proxyquire = require('proxyquire').noCallThru();
const CFError     =require('cf-errors');
var expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('run pipline test', () => {


    describe('getAllByUser tests', function() {

        describe('postive', function() {
            it('Should pass and return a id of the image', () => {
                var info = {
                    url: 'https://g.codefresh.io',
                    branch : 'master',
                    noCache : false,
                    resetVolume : false,
                    variables : [],
                    repoOwner:'codefresh-io',
                    repoName: 'demochat',
                    pipelineName: 'demochat',
                    token: process.env.CF_TOKEN
                };


                const commandsProxy = proxyquire('../command.js', {
                    'request': {
                        get: ({}, callback) => {
                            callback(null,null,"id")
                        }
                    }
                });

                return commandsProxy.getAllByUser(info).then((res)=> {
                    expect(res).to.deep.equal("id")
                });
            });
        });




        describe('negative', function() {
            it('Should failed and return a id of the image', () => {
                var info = {
                    url: 'https://g.codefresh.io',
                    branch : 'master',
                    noCache : false,
                    resetVolume : false,
                    variables : [],
                    repoOwner:'codefresh-io',
                    repoName: 'demochat',
                    pipelineName: 'demochat',
                    token: process.env.CF_TOKEN
                };
                const commandsProxy = proxyquire('../command.js', {
                    'request': {
                        get: ({}, callback) => {
                            callback(new CFError('fail get request'),null,null)
                        }
                    }
                });

                return commandsProxy.getAllByUser(info)
                    .catch((err)=>{
                        expect(err.message).to.contain('fail get request');
                    })
            });
        });
    });



});


