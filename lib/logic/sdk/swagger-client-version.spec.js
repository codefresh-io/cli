const path = require('path');
const semver = require('semver');
const { resolutions } = require('../../../package.json');

const ALLOWED_RANGE = '~3.13.7';
const RESOLUTION_KEY = '**/swagger-client';

const REASON = `
swagger-client must stay on ${ALLOWED_RANGE}. Do not upgrade it.

swagger-client 3.3x loads the whole @swagger-api/apidom stack on startup.
With it every CLI process uses ~300 MiB of memory instead of ~170 MiB, and
builds that run several codefresh-run steps in parallel (the CLI image is used
by the codefresh-run step) are OOM-killed (CF-2716).

The version is forced by "resolutions" in package.json, so codefresh-sdk can
be upgraded independently: the CLI tests then check the new codefresh-sdk
with this swagger-client version.

If you know the reason above and are sure that you want to upgrade
swagger-client, check the memory usage of the CLI, remove the
"${RESOLUTION_KEY}" resolution and then delete this test.
`;

function getInstalledVersion() {
    // the copy that codefresh-sdk actually loads
    const sdkDir = path.dirname(require.resolve('codefresh-sdk/package.json'));
    const pkg = require.resolve('swagger-client/package.json', { paths: [sdkDir] });
    return require(pkg).version; // eslint-disable-line
}

describe('swagger-client version', () => {
    it(`should be forced to ${ALLOWED_RANGE} by package.json resolutions`, () => {
        const actual = resolutions[RESOLUTION_KEY];
        if (actual !== ALLOWED_RANGE) {
            throw new Error(`package.json "resolutions"."${RESOLUTION_KEY}": "${actual}" is not allowed.\n${REASON}`);
        }
    });

    it(`should be installed in ${ALLOWED_RANGE} range`, () => {
        const actual = getInstalledVersion();
        if (!semver.satisfies(actual, ALLOWED_RANGE)) {
            throw new Error(`installed swagger-client: "${actual}" is not allowed.\n${REASON}`);
        }
    });
});
