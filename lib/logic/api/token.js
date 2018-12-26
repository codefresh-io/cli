const { sendHttpRequest } = require('./helper');
const Token = require('../entities/Token');

const generateToken = async (info) => {
    const options = {
        url: '/api/auth/key',
        method: 'POST',
        qs: {
            subjectType: info.subjectType,
            subjectReference: info.subjectReference,
        },
        body: {
            name: info.name,
        },
    };
    const token = await sendHttpRequest(options);
    return {
        token,
    };
};

const getTokens = async () => {
    const options = {
        url: '/api/auth/keys',
        method: 'GET',
    };
    const result = await sendHttpRequest(options);
    return result.map(Token.fromResponse);
};

const deleteToken = (id) => {
    const options = {
        url: `/api/auth/key/${id}`,
        method: 'DELETE',
    };
    return sendHttpRequest(options);
};


module.exports = {
    generateToken,
    getTokens,
    deleteToken,
};
