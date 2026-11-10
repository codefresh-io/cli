const semver = require('semver');
const { version: installedVersion } = require('codefresh-sdk/package.json');
const { dependencies, resolutions } = require('../../../package.json');

const PINNED_VERSION = '1.13.3';

const REASON = `
codefresh-sdk must stay pinned to ${PINNED_VERSION}. Do not upgrade it.

codefresh-sdk 2.x depends on swagger-client 3.3x, which loads the whole
@swagger-api/apidom stack on startup. With it every CLI process uses ~300 MiB
of memory instead of ~170 MiB, and builds that run several codefresh-run steps
in parallel are OOM-killed (CF-2716).

If you know the reason above and are sure that you want to upgrade
codefresh-sdk, check the memory usage of the CLI and then delete this test.
`;

function assertPinned(actual, where) {
    if (actual !== PINNED_VERSION && !(semver.valid(actual) && semver.lte(actual, PINNED_VERSION))) {
        throw new Error(`${where}: "${actual}" is not allowed.\n${REASON}`);
    }
}

describe('codefresh-sdk version', () => {
    it(`should be pinned to ${PINNED_VERSION} in package.json dependencies`, () => {
        assertPinned(dependencies['codefresh-sdk'], 'package.json "dependencies"');
    });

    it(`should be pinned to ${PINNED_VERSION} in package.json resolutions`, () => {
        assertPinned(resolutions['codefresh-sdk'], 'package.json "resolutions"');
    });

    it(`should not be higher than ${PINNED_VERSION} when installed`, () => {
        assertPinned(installedVersion, 'installed codefresh-sdk');
    });
});
