var program = require('commander');
var api         = require('../../lib/api');



program
    .command('environments list')
    .description('show all running environments')
    .action(function(){
        api.environments.list()
            .then(function(environments) {

                if (environments.length === 0) {
                    return console.log('no running environments');
                }

                var spaces = '                                                                                                                ';
                var printInfo = function(idLength, info) {
                    var line = info.id + spaces.substring(0, idLength+1 - (info.id.length)) +
                        info.user + spaces.substring(0, 20 - (info.user.length)) +
                        info.created + spaces.substring(0, 26 - (info.created.length)) +
                        info.instances + spaces.substring(0,  10 - (info.instances.length));

                    console.log(line);
                }

                var maxId = 0;
                environments.map(function(env) {
                    maxId = Math.max(maxId, env.id.length);
                });

                printInfo(maxId, {
                    id: 'Id',
                    user: 'User',
                    created: 'Created',
                    instances: 'Instances'
                });
                printInfo(maxId, {
                    id:         '--------------------------------------------------------------------------------------------\
                                 ----------------------------------------------'.substring(0, maxId),
                    user:       '-------------------',
                    created:    '------------------------',
                    instances:  '---------'
                });



                environments.map(function(env) {
                    printInfo(maxId, {
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
    });
