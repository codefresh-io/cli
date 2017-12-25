const getContexts = require('./get-contexts');
const useContext = require('./use-context');
const currentContext = require('./current-context');
const createContext = require('./create-context');
const login = require('./login');
const authRoot = require('../root/auth');

authRoot.subCommand(getContexts)
    .subCommand(useContext)
    .subCommand(currentContext)
    .subCommand(login)
    .subCommand(createContext);
