export default {
    scripts: [
        'lib/**/*.js',
        'node_modules/codefresh-sdk/lib/**/*.js',
        'node_modules/kubernetes-client/**/*.js',
        'node_modules/generator-function/*.js',
        'node_modules/async-function/*.js',
    ],
    assets: 'lib/**/*.hbs',
    targets: [
        'node24-linuxstatic-x64',
        'node24-linuxstatic-arm64',
        'node24-macos-x64',
        'node24-win-x64',
    ],
    outputPath: 'dist',
    options: ['no-experimental-require-module', 'no-warnings'],
    bytecode: false,
    public: true,
    publicPackages: ['*'],
};
