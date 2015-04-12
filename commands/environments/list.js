var api         = require('../../lib/api');

var spaces = '                                                                            ';
var printInfo = function(info) {
    var line = info.id + spaces.substring(0, 37 - (info.id.length)) +
        info.user + spaces.substring(0, 20 - (info.user.length)) +
        info.created + spaces.substring(0, 26 - (info.created.length)) +
        info.instances + spaces.substring(0,  10 - (info.instances.length));

    console.log(line);
}
api.environments.list()
    .then(function(environments) {

        if (environments.length === 0) {
            return console.log('no running environments');
        }

        printInfo({
            id: 'Id',
            user: 'User',
            created: 'Created',
            instances: 'Instances'
        });
        printInfo({
            id:         '------------------------------------',
            user:       '-------------------',
            created:    '------------------------',
            instances:  '---------'
        });

        environments.map(function(env) {
            printInfo({
                id: env.id,
                user: env.userName,
                created: env.created,
                instances: env.instances.length
            });
        });
    })
    .catch(function(err) {
        console.error(err);
    });
