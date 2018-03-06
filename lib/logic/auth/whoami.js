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
let accounts = _.get(user, "account", {});
let accountInfo = _.chain(accounts)
.filter((account)=> account.name === user.activeAccountName)
 .get("[0]", {})
 .pick("name", "runtimeEnvironment").value();

debug("account info - " + JSON.stringify(accountInfo));
debug(`current account name is : ${JSON.stringify(_.get(user, "activeAccountName"))}`);

return accountInfo;


}

module.exports = {whoami}
