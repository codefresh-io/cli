const { sendHttpRequest } = require('./helper');

const getByAuthContext = async (authContext) => {
    const options = {
        url: '/api/user',
        method: 'GET',
    };

    return sendHttpRequest(options, authContext);
};


module.exports = {
    getByAuthContext,
};
