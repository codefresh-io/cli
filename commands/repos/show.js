var api         = require('../../lib/api'),
    utils         = require('../../lib/utils');

var spaces = '                                                                            ';
var printInfo = function(info) {
    var message = info.message.length > 50 ?
                info.message.substring(0, 46) + '...' : info.message;
    message = message.replace(/\n/g, ' ');

    var line = info.name + spaces.substring(0, 30 - (info.name.length)) +
        info.branch + spaces.substring(0, 20 - (info.branch.length)) +
        message + spaces.substring(0, 50 - (message.length)) +
        info.created + spaces.substring(0, 22 - (info.created.length)) +
        info.createdBy + spaces.substring(0,  20 - (info.createdBy));

    console.log(line);
};

module.exports = function(repo_id) {

    api.repos.branches(repo_id)
        .then(function (branches) {

            // console.log(JSON.stringify(branches, null, 2));


            printInfo({
                name: 'Name',
                branch: 'Branch',
                message: 'Message',
                created: 'Commit Date',
                createdBy: 'Commited By'
            });

            printInfo({
                name: '-----------------------------',
                branch: '------------------',
                message: '-------------------------------------------------',
                created: '---------------------',
                createdBy: '-----------------'
            });

            branches.map(function (branch) {

                var lastCommit = branch.commits[0];

                printInfo({
                    name: repo_id,
                    branch: branch.name,
                    message: lastCommit.message,
                    created: utils.timeAgo(lastCommit.date),
                    createdBy: lastCommit.committer ? lastCommit.committer.name : lastCommit.name
                });

            });


        })
        .catch(function (err) {
            console.error(err);
        });
};