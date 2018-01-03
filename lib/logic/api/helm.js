const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');


const installChart = async ({
    cluster,
    namespace,
    name,
    repository,
    version,
    values,
    releaseName,
}) => {
    const normalizedValues = _.map(values, value => Object.assign({
        name: value,
    }, {}));
    console.log(normalizedValues);
    const options = {
        url: '/api/kubernetes/chart/install',
        method: 'POST',
        qs: {
            selector: cluster,
            namespace: 'minikube',
        },
        body: {
            name,
            repository,
            namespace,
            values: normalizedValues,
            version,
            releaseName,
        },
    };

    const res = await sendHttpRequest(options);
    return res.id;
};

module.exports = {
    installChart,
};
