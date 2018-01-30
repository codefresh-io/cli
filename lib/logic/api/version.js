const { sendHttpRequest } = require('./helper');


const getServerVersion = async () => {
    const options = {
        url: '/api/version',
        method: 'GET',
    };

    return sendHttpRequest(options);
};

const getHermesVersion = async () => {
    const options = {
        url: '/api/hermes/version',
        method: 'GET',
    };

    return sendHttpRequest(options);
};

const getNomiosVersion = async () => {
    const options = {
        url: '/nomios/version',
        method: 'GET',
    };

    return sendHttpRequest(options);
};

module.exports = {
    getServerVersion,
    getHermesVersion,
    getNomiosVersion,
};
