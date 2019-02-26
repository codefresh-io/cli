/* eslint-disable */

const context = require('../index'); // eslint-disable-line
const { whoami } = require('./whoami');
const { APIKeyContext } = require('./index');

jest.mock('../../api/helper', () => { // eslint-disable-line
    const apiHelper = require.requireActual('../../api/helper');

    let response;
    let validateParams;

    const __setResponse = (x) => {
        response = x;
    };

    const __setValidateParams = (x) => {
        validateParams = x;
    };

    const __reset = () => {
        response = null;
        validateParams = null;
    };

    const sendHttpRequest = (userOptions, context, flag) => { // eslint-disable-line
        if (validateParams) {
            validateParams(userOptions, context, flag);
        }

        if (response) {
            return response();
        } else { // eslint-disable-line
            return apiHelper.sendHttpRequest(userOptions, {authContext: context, throwOnUnauthorized: flag});
        }
    };

    return {
        __setResponse,
        __setValidateParams,
        __reset,
        sendHttpRequest,
    };
});

const apiHelper = require('../../api/helper');

beforeEach(() => {
    apiHelper.__reset();
});

describe('whoami tests', () => {

    describe('api key context', () => {

        describe('positive', () => {

            it('should return account information in case context is valid', () => {
                const context = new APIKeyContext({
                    name: 'test-context',
                    url: 'http://test',
                    token: 'test-token',
                });

                apiHelper.__setValidateParams((userOptions, requestOptions) => {
                    expect(userOptions)
                        .toEqual({
                            'method': 'GET',
                            'url': '/api/user/',
                        });
                    expect(requestOptions.throwOnUnauthorized)
                        .toEqual(true);
                });

                apiHelper.__setResponse(() => {
                    return Promise.resolve({
                        activeAccountName: 'account-name-1',
                        account: [
                            {
                                name: 'account-name-1',
                                runtimeEnvironment: 'runtime-environment-1',
                            },
                            {
                                name: 'account-name-2',
                                runtimeEnvironment: 'runtime-environment-2',
                            },
                        ],
                    });
                });

                return whoami(context)
                    .then((accountInfo) => {
                        expect(accountInfo)
                            .toEqual({
                                name: 'account-name-1',
                                runtimeEnvironment: 'runtime-environment-1',
                            });
                    });

            });

        });

        describe('negative', () => {

            it('should fail in case context is not valid', () => {
                const context = new APIKeyContext({
                    name: 'test-context',
                    url: 'http://test',
                    token: 'test-token',
                });

                apiHelper.__setResponse(() => {
                    return Promise.reject(new Error('http request error'));
                });

                return whoami(context)
                    .then(() => {
                        throw new Error('should have failed');
                    }, (err) => {
                        expect(err.toString())
                            .toEqual('Error: http request error');
                    });

            });

        });
    });

});
