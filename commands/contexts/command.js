/**
 * Created by nikolai on 24.8.16.
 */

const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');


const getContexts = function (info) {
    const url =""; // ask arik for the end point
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    return new Promise(function (resolve,reject) {
        request.get({url: url, headers: headers}, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};



module.exports.getContexts = getContexts;

