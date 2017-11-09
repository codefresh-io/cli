"use strict";
var commands     = require('../command');
var prettyjson  = require('prettyjson');
var chai = require("chai");
//var sinon = require('sinon');

var expect = chai.expect;
chai.use(require('chai-as-promised'));
//chai.use(require('sinon-chai'));

describe('run pipline test', () => {

    it('run pipeline success', (done) => {
        var info = {
            repoOwner:'codefresh-io',
            repoName: 'demochat',
            pipelineName: 'demochat',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODIiLCJhY2NvdW50SWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODMiLCJpYXQiOjE1MDkzNTAwMDcsImV4cCI6MTUxMTk0MjAwN30.4DwyRb-71XZDXvnFJAe3cQnQp34FK0Q2jnne9eVpYJk'
        };
        return expect(commands.executePipeline(info)).to.eventually.be.rejected;
    });

    it('run pipeline fails', (done) => {
        var info = {
            repoOwner:'codefresh-io',
            repoName: 'ziv',
            pipelineName: 'demochat',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODIiLCJhY2NvdW50SWQiOiI1OWQzNzgzNzkyMGY4OTAwMDE4YTYxODMiLCJpYXQiOjE1MDkzNTAwMDcsImV4cCI6MTUxMTk0MjAwN30.4DwyRb-71XZDXvnFJAe3cQnQp34FK0Q2jnne9eVpYJk'
        };
        return expect(commands.executePipeline(info)).to.eventually.be.rejected;
    });



});


