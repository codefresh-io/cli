const { sendHttpRequest } = require('./helper');

const getNomiosVersion = async () => {
    const options = {
        url: '/nomios/version',
        method: 'GET',
    };

    return sendHttpRequest(options);
};

module.exports = {
    getNomiosVersion,
};
