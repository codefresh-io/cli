const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');


const getPipelines = function (info) {
    const url =`${info.url}/api/pipelines/next-gen`;
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    let payload = {
        variables: extractVariables(info),
    };
    return new Promise(function (resolve,reject) {
        request.get({url: url, headers: headers, json:payload}, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};

function extractVariables(info) {
    let variables = {};
    let length = info.variables.length;
    if (length!==1 && length % 2 ===1){
        console.log('invalid environment variables please enter [key] [value]');
        length -=1;
    }
    for (let i = 0; i < length-1; i++) {
        let key = info.variables[i];
        let val = info.variables[i+1];
        variables[key] = val.toString();
        i++;
    }
    return variables;
}



module.exports.getPipelines = getPipelines;

