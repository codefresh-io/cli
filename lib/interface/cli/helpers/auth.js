const _ = require('lodash');
const columnify = require('columnify');
const { auth } = require('../../../logic');
const authManager = auth.manager;

const printTableForAuthContexts = () => {
    const currentContext = authManager.getCurrentContext();
    const contexts = authManager.getAllContexts();
    const keys = currentContext.defaultColumns;
    const res = [];
    let obj = [];
    _.forEach(contexts, (context) => {
        obj = [];
        _.forEach(keys, (key) => {
            if (key === 'current') {
                (context === currentContext) ? obj[key.toUpperCase()] = '*' : obj[key.toUpperCase()] = '';
            }
            else {
                obj[key.toUpperCase()] = context[key];
            }
        });
        res.push(obj);
    });
    const columns = columnify(res);
    console.log(columns);
};

module.exports = { printTableForAuthContexts };
