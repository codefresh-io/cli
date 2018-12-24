const _ = require('lodash');
const { sendHttpRequest } = require('./helper');

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


module.exports = {
    generateToken,
};
