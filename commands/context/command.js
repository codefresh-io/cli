const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');
const YAML        = require('yamljs');
const _           = require('lodash');


const getContextByName = function (info) {
    const url =`${info.url}/contexts/${info.authorization}/${info.name}`;
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    let payload = {
        variables: extractVariables(info),
    };
    return new Promise(function (resolve,reject) {
        request.get({url: url, headers: headers,json:payload}, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};


const createOrReplaceContextByFile = function (info) {
    let requestData;
    return new Promise(function (resolve,reject) {
    try{
        requestData = YAML.load(info.file);
    }catch(err) {
        return reject(new CFError(err.message));
    }
    const url =`${info.url}/contexts/${info.authorization}`;
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    let payload = {
        variables: extractVariables(info),
        requestData : requestData
    };
    request({
        url: url,
        method: "POST",
        headers: headers,
        json: payload
    }, function (err, httpRes, body) {
        if(err) {
            return reject(new CFError(err));
        }
        return resolve(body);
    });
    })
};



const deleteContext = function (info) {
    let url;
    let requestData;
    return new Promise(function (resolve,reject) {
        if (_.isUndefined(info.name)) {
            url =`${info.url}/contexts/${info.authorization}`;
            try{
                requestData = YAML.load(info.file);
            }catch(err) {
                return reject(new CFError(err.message));
            }
        }
        else{
            url = `${info.url}/contexts/${info.authorization}/${info.name}`;
            requestData='';
        }
        let headers = {
            'Accept': 'application/json',
            'X-Access-Token': info.token
        };
        let payload = {
            variables: extractVariables(info),
            requestData : requestData
        };
        request({
            url: url,
            method: "DELETE",
            headers: headers,
            json: payload
        }, function (err, httpRes, body) {
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

module.exports.getContextByName = getContextByName;
module.exports.createOrReplaceContextByFile = createOrReplaceContextByFile;
module.exports.deleteContext = deleteContext;
