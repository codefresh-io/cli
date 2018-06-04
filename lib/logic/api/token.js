const { sendHttpRequest } = require('./helper');

module.exports = (tokenName)=> sendHttpRequest({
    url: 'api/auth/key',
    method: 'POST',
    body: { name: tokenName },
});
