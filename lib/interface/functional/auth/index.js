require('debug')('codefresh:functional:functions:auth');

const CFError = require('cf-errors');
const { auth } = require('../../../logic/index');
const DEFAULTS = require('../defaults');

const { JWTContext, APIKeyContext } = auth.contexts;
const authManager = auth.manager;

//--------------------------------------------------------------------------------------------------
// Private
//--------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
const _loginWithUserPassword = async (url, username, password) => {
    try {
        // TODO implement logic to get token by calling the pai
    } catch (err) {
        throw new CFError({
            cause: err,
            message: 'Failed to login with username and password',
        });
    }
};


const _loginWithToken = async (url, token) => {
    let authContext;
    try {
        authContext = JWTContext.createFromToken(token, url);
        return authContext;
    } catch (err) {
        try {
            authContext = APIKeyContext.createFromToken(token, url);
            return authContext;
        } catch (err2) {
            const error = new CFError({
                cause: err2,
                message: 'Failed to login with api key',
            });
            throw error;
        }
    }
};

//--------------------------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------------------------

const getAllAuthContexts = async () => {
    const allAuthContexts = authManager.getAllContexts();

    return allAuthContexts;
};

const getCurrentAuthContext = async () => {
    const currentContext = authManager.getCurrentContext();
    if (currentContext) {
        return currentContext.getName();
    }

    throw new CFError('There are no contexts in cfconfig file');
};

const setCurrentAuthContext = async (name) => {
    const contextName = name;

    const currentContextName = await getCurrentAuthContext();
    if (currentContextName === contextName) {
        // Context already set - do nothing
        return;
    }


    const context = authManager.getContextByName(contextName);
    if (context) {
        authManager.setCurrentContext(context);
        authManager.persistContexts();
        console.log(`Switched to context ${contextName}`);
    } else {
        throw new CFError(`No context exists with the name: ${contextName}`);
    }
};

const createAuthContextWithLogin = async (username, password, url = DEFAULTS.URL) => {
    const authContext = await _loginWithUserPassword(username, password, url);

    await authContext.validate();
    await authManager.addContext(authContext);
    await authManager.setCurrentContext(authContext);
    await authManager.persistContexts(authContext);

    console.log(`Login succeeded to ${authContext.url}`);
    console.log(`Switched to context: ${authContext.name}`);
};


const createAuthContextWithToken = async (token, name, url = DEFAULTS.URL) => {
    // const type = JWTContext.TYPE;
    const authContext = await _loginWithToken(url, token);

    await authContext.validate();

    if (name) {
        authContext.setName(name);
    }

    let updatedExistingContext = false;
    if (authManager.getContextByName(authContext.getName())) {
        updatedExistingContext = true;
    }

    await authManager.addContext(authContext);
    await authManager.setCurrentContext(authContext);
    await authManager.persistContexts(authContext);

    if (updatedExistingContext) {
        console.log(`Updated context: ${authContext.name}`);
    } else {
        console.log(`Created new context: ${authContext.name}`);
    }

    console.log(`Switched to context: ${authContext.name}`);
};

module.exports = {
    getAllAuthContexts,
    getCurrentAuthContext,
    setCurrentAuthContext,
    createAuthContextWithLogin,
    createAuthContextWithToken,
};
