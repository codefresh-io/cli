const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const Registry = require('../entities/Registry');

const BASE_API_URL = '/api/registries';

const _extractFieldsForContextEntity = ref => ({
    provider: ref.provider,
    name: ref.name,
    kind: ref.kind,
    _id: ref._id,
    behindFirewall: ref.behindFirewall,
    default: ref.default,
});

async function _test(opt) {
    if (opt.behindFirewall) {
        return Promise.resolve();
    }
    return sendHttpRequest({
        url: `${BASE_API_URL}/test/`,
        method: 'POST',
        body: opt,
    });
}

async function list() {
    const res = await sendHttpRequest({
        url: BASE_API_URL,
    });
    return _.chain(res)
        .map(_extractFieldsForContextEntity)
        .map(data => new Registry(data))
        .value();
}


async function create(opt = {}) {
    await _test(opt);
    const res = await sendHttpRequest({
        url: BASE_API_URL,
        method: 'POST',
        body: opt,
    });
    return res;
}

async function remove(id) {
    const res = await sendHttpRequest({
        url: `${BASE_API_URL}/${id}`,
        method: 'DELETE',
    });
    return res;
}

module.exports = {
    list,
    create,
    remove,
};
