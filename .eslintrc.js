module.exports = {
    'plugins': [
        'mocha'
    ],
    'extends': 'airbnb-base',
    'rules': {
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-underscore-dangle': [0],
        'max-len': ['error', {
            'code': 140,
            'ignoreComments': true
        }],
    },
    'env': {
        'mocha': true,
    }
};
