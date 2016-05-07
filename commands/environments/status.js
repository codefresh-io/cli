var program     = require('commander'),
    api         = require('../../lib/api');

program
    .command('environment-status <envId>')
    .description('show status of specific environment')
    .action(function(envId){
        api.environments.status(envId)
            .then(function(status) {
                console.log(status);
            })
            .catch(function(err) {
                console.error(err);
            });
    });