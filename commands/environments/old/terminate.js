var program     = require('commander'),
    api         = require('../../../lib/api');

program
    .command('environment-terminate <envId>')
    .description('terminate running environment')
    .action(function(envId){
        api.environments.terminate(envId)
            .then(function(status) {
                console.log(status);
            })
            .catch(function(err) {
                console.error(err);
            });

    });
