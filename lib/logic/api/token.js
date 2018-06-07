const { sendHttpRequest } = require('./helper');

module.exports = {
    createToken: (tokenName)=> sendHttpRequest({
        url: 'api/auth/key',
        method: 'POST',
        body: { name: tokenName },
    }),
    listToken: ()=> sendHttpRequest({
        url: 'api/auth/keys',
        method: 'GET',
    }),
};
