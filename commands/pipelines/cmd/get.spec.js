"use strict";
var commands     = require('../command');
var prettyjson  = require('prettyjson');
var chai = require("chai");
//var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('chai-as-promised'));
//chai.use(require('sinon-chai'));

describe('run pipline test', () => {

    it('run pipeline success', () => {
        var info = {
            url: 'https://g.codefresh.io',
            branch : 'master',
            noCache : false,
            resetVolume : false,
            variables : [],
            repoOwner:'codefresh-io',
            repoName: 'demochat',
            pipelineName: 'demochat',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODIiLCJhY2NvdW50SWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODMiLCJpYXQiOjE1MDkzNTAwMDcsImV4cCI6MTUxMTk0MjAwN30.4DwyRb-71XZDXvnFJAe3cQnQp34FK0Q2jnne9eVpYJk'
        };
        return commands.executePipeline(info).then(function(res){
            expect(res).to.not.equal({});
        });
    }).timeout(3000);


    it('run pipeline fails', () => {
        var info = {
            url: 'https://g.codefresh.io',
            branch : 'master',
            noCache : false,
            resetVolume : false,
            variables : [],
            repoOwner:'codefresh-io',
            pipelineName: 'demochat',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODIiLCJhY2NvdW50SWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODMiLCJpYXQiOjE1MDkzNTAwMDcsImV4cCI6MTUxMTk0MjAwN30.4DwyRb-71XZDXvnFJAe3cQnQp34FK0Q2jnne9eVpYJk'
        };
        return commands.executePipeline(info).then(function(res){
        },(err)=>{
            expect(err.message).to.be.equal("you must provide [pipelineid] or [pipelineName] [repoName] [repoOwner]");
        });
    }).timeout(3000);



});


