"use strict";
const chai      = require("chai");
const expect    = chai.expect;
chai.use(require('chai-as-promised'));
const proxyquire = require('proxyquire').noCallThru();
const CFError     = require('cf-errors');

describe('context delete test', () => {

        describe('deleteContext test', function() {

            describe('postive', function() {

                it('Should pass and return the delete context name (when file is provide)', () => {
                    var info = {
                        url: 'https://g.codefresh.io',
                        file : '/Users/codefresh/WebstormProjects/untitled2/f.yaml', //change for dynamic path
                        token: process.env.CF_TOKEN,
                        authorization: 'account'
                    };


                    const commandsProxy = proxyquire('../command.js', {
                        'request': ({}, callback) => {
                            callback(null,null,"context1")

                        }
                    });

                    return commandsProxy.deleteContext(info).then((res)=> {
                        expect(res).to.deep.equal("context1")
                    });
                });


                it('Should pass and return the delete context name (when name is provide)', () => {
                    var info = {
                        url: 'https://g.codefresh.io',
                        name: "context1",
                        token: process.env.CF_TOKEN,
                        authorization: 'account'
                    };


                    const commandsProxy = proxyquire('../command.js', {
                        'request': ({}, callback) => {
                            callback(null,null,"context1")

                        }
                    });

                    return commandsProxy.deleteContext(info).then((res)=> {
                        expect(res).to.deep.equal("context1")
                    });
                });
            });


            describe('negative', function() {
                it('Should fail and return an error (when file is provide)', () => {
                    var info = {
                        url: 'https://g.codefresh.io',
                        file : '/Users/codefresh/WebstormProjects/untitled2/f.yaml', //change for dynamic path
                        token: process.env.CF_TOKEN,
                        authorization: 'account'
                    };
                    const commandsProxy = proxyquire('../command.js', {
                        'request': ({}, callback) => {
                            callback(new CFError('fail post request'),null,null)

                        }
                    });

                    return commandsProxy.deleteContext(info)
                        .catch((err)=>{
                            expect(err.message).to.contain('fail post request');
                        })
                });

                it('Should fail and return an error (when name is provide)', () => {
                    var info = {
                        url: 'https://g.codefresh.io',
                        name:"context1",
                        token: process.env.CF_TOKEN,
                        authorization: 'account'
                    };
                    const commandsProxy = proxyquire('../command.js', {
                        'request': ({}, callback) => {
                            callback(new CFError('fail post request'),null,null)

                        }
                    });

                    return commandsProxy.deleteContext(info)
                        .catch((err)=>{
                            expect(err.message).to.contain('fail post request');
                        })
                });
            });
        });
});


