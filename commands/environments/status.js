var api         = require('../../lib/api');

var envId = process.argv.shift();
api.environments.status(envId)
    .then(function(status) {
        console.log(status);
    })
    .catch(function(err) {
        console.error(err);
    });
