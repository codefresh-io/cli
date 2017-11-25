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
            token: process.env.CF_TOKEN
        };
        return commands.executePipeline(info).then(function(res){
            expect(res).to.not.equal({});
        });
    }).timeout(3000);


    it('run pipeline fails repoName missing', () => {
        var info = {
            url: 'https://g.codefresh.io',
            branch : 'master',
            noCache : false,
            resetVolume : false,
            variables : [],
            repoOwner:'codefresh-io',
            pipelineName: 'demochat',
            token: process.env.CF_TOKEN
        };
        return commands.executePipeline(info).then(function(res){
        },(err)=>{
            expect(err.message).to.be.equal("you must provide [pipelineid] or [pipelineName] [repoName] [repoOwner]");
        });
    }).timeout(3000);


    it('run pipeline fails repoName wrong', () => {
        var info = {
            url: 'https://g.codefresh.io',
            branch : 'master',
            noCache : false,
            resetVolume : false,
            variables : [],
            repoOwner:'codefresh-io',
            repoName: 'lala',
            pipelineName: 'demochat',
            token: process.env.CF_TOKEN
        };
        return commands.executePipeline(info).then(function(res){
        },(err)=>{
            expect(err.message).to.be.equal(`Pipeline with name ${info.pipelineName} wasn't found for owner ${info.repoOwner} and repo ${info.repoName}.`);
        });
    }).timeout(3000);




});


