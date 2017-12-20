const getContexts    = require('./get-contexts');
const useContext     = require('./use-context');
const currentContext = require('./current-context');
const createContext  = require('./create-context');
const login          = require('./login');
const auth = require('../verbs').auth;

auth.subCommand(getContexts)
.subCommand(useContext)
.subCommand(currentContext)
.subCommand(login)
.subCommand(createContext);
