const path = require('path');
const fs = require('fs');
const defaults = require('../defaults');
const { version: cliVersion } = require('../../../../package');
const request = require('request-promise');

const loadOpenApiSpec = async ({ url = null, useCache = true } = {}) => {
    if (!useCache) {
        const response = await request({ url: url || `${defaults.URL}/api/openapi.json`, method: 'GET' });
        return JSON.parse(response);
    }

    const cacheDir = path.join(defaults.CODEFRESH_PATH, 'openapi-cache');
    const cacheFileName = `openapi@${cliVersion}.json`;
    const cachePath = path.join(cacheDir, cacheFileName);
    if (fs.existsSync(cachePath)) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }
    const rawSpec = await request({ url: url || `${defaults.URL}/api/openapi.json`, method: 'GET' });
    const spec = JSON.parse(rawSpec);
    fs.writeFileSync(cachePath, rawSpec);
    return spec;
};

module.exports = {
    loadOpenApiSpec,
};
