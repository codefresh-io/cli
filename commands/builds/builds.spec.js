"use strict";

var debug       = require('debug')('connector.spec');
var request     = require('superagent-use');
var prettyjson  = require('prettyjson');

describe('builds test', () => {
    var login ;
    var url;

    var credentials = {
        user: process.env.USERNAME,
        password: process.env.PASSWORD
    };

    before((done) => {
        console.log('test setup');

        var Login = require('../login/connector');
        url =  'https://g-staging.codefresh.io';
        login = new Login(url, credentials);
        done();
    });

    it('get build', (done) => {
        var params = {
            account: '',
            repoOwner: '',
            repoName: ''
        };
        let buildUrl =  `${url}/api/builds?limit=10&page=1&account=${params.account}&repoOwner=${params.repoOwner}&repoName=${params.repoName}&type=webhook`;
        console.log(url);

        login.connect().then(()=>{
            request
                .get(buildUrl)
                .on('request', function(req) {
                    console.log('trying to connect to '  + req.url); // => https://api.example.com/auth
                })
                //.set('X-API-Key', 'foobar')
                .set('Accept', 'application/json')
                .end(function(err, res){
                    debug('request completed');
                    debug(res);
                    if (err){
                        console.log(res);
                        return done(err);
                    }

                    console.log(prettyjson.render(res.body));
                    debug('new token created');
                    done();
                });
        });

    });

});
