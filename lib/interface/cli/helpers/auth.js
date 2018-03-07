const _ = require('lodash');
const columnify = require('columnify');
const { auth } = require('../../../logic');
const authManager = auth.manager;
const kefir = require('kefir');
const assert = require('assert');
const debug = require('debug')('auth');
const colors = require('colors');

const printTableForAuthContexts =  ({filter="all"}) => {
  let contexts;
  if (filter === "all")
  contexts = _.keys(authManager.getAllContexts());
  if (filter === "current")
  contexts =  [_.get(authManager.getCurrentContext(), "name", {})];


    const res = [];
    let mergedKeys = [];
    let contextsInfo = {}
    return kefir.sequentially(0, contexts).flatMap((contextName)=>{
       let context = authManager.getContextByName(contextName);
       debug(`context to check ${context.name}`);
       return kefir.fromPromise(context.addAccountInfo().then(()=>{
          mergedKeys = _.union(mergedKeys, context.defaultColumns);
         let ret =  _.chain(context).pick(context.defaultColumns).mapValues((value, key)=>{
           if (key === "current") return "*".green;
           return JSON.stringify(value)
         }).value();

         return ret;
       }));
     }).scan((prev , context)=>{
        prev.push(context);
        return prev;
    }, []).flatMap((info)=>{
          output = columnify(info, {columns: mergedKeys});
          return kefir.constant(output);
    }).ignoreErrors().toPromise();

};

module.exports = { printTableForAuthContexts };
