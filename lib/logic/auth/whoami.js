const contexts = require('./contexts');
const {sendHttpRequest} = require('../api/helper')
const _  = require('lodash');
const debug = require('debug')("whoami");


const whoami = async (context)=>{
  //there is some circular depency
const authManager = require('./manager');

//let context = authManager.getContextByName(contextName);
if (_.isUndefined(context))
 context = authManager.getCurrentContext();

debug(`context is ${context} for ${context.name}`);
const userOptions = {
  url: '/api/user/',
  method: 'GET',
}
let user  =  await sendHttpRequest(userOptions, context );
//need it only to retrieve account ID , once you will propose better way will change

const buildOptions = {
    url: '/api/builds/',
    method: 'GET',
};

let builds = await sendHttpRequest(buildOptions, context);
let accountId = _.get(builds, "builds.docs[0].account", -1);
if (accountId === -1 ){
   debug('could not identify account Info')
   return Promise.resolve({})
}
let accountOptions = {
  url: `/api/accounts/${accountId}`,
  method: 'GET',
}

let accountsInfo = _.chain(user.account).filter((account)=>{
    return account._id === accountId
}).get("[0]", {}).pick("_id", "name", "runtimeEnvironment").value();

debug(`account name is : ${JSON.stringify(_.get(accountsInfo, "name"))}`);
debug(`runtime environment is : ${JSON.stringify(_.get(accountsInfo, "runtimeEnvironment"))}`)

return accountsInfo;


}

module.exports = {whoami}
