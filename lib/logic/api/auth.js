const { sendHttpRequest } = require('./helper');


const createContext = async () => {
    const options = {
        url: '/api/user/context',
        method: 'POST',
    };

    return sendHttpRequest(options);
};

module.exports = {
    createContext,
};
