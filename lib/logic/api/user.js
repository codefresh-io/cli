const { sendHttpRequest } = require('./helper');

const getByAuthContext = async (authContext) => {
    const options = {
        url: '/api/user',
        method: 'GET',
    };

    return await sendHttpRequest(options, authContext);
};


module.exports = {
    getByAuthContext,
};