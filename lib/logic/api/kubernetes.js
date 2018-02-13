const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');


const generateImagePullSecret = async (data) => {

    const body = {
        registry: data.registry,
    };

    const options = {
        url: '/api/kubernetes/secrets/imagePullSecret',
        method: 'POST',
        qs: {
            namespace: data.namespace,
            selector: data.cluster,
        },
        body,
    };
    return sendHttpRequest(options);
};


module.exports = {
    generateImagePullSecret,
};
