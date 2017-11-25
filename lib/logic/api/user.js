const { sendHttpRequest } = require('./helper');

const getByAuthContext = async (authContext) => {
    const options = {
        method: 'GET',
    };

    await sendHttpRequest(options, authContext);
};


module.exports = {
    getByAuthContext,
};