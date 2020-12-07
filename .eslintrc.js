module.exports = {
    'plugins': [
        'jest'
    ],
    'extends': 'airbnb-base',
    'rules': {
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-underscore-dangle': [0],
        'max-len': ['error', {
            'code': 140,
            'ignoreComments': true
        }],
        'no-console': 0,
        'object-curly-newline': 0,
    },
    'env': {
        'jest': true,
    }
};
