var api         = require('../../lib/api'),
    utils         = require('../../lib/utils');

module.exports = function() {

    var spaces = '                                                                            ';
    var printInfo = function(info) {
        var line = info.name + spaces.substring(0, 50 - (info.name.length)) +
            info.private + spaces.substring(0, 12 - (info.private.length)) +
            info.updated + spaces.substring(0, 26 - (info.updated.length)) +
            info.open_issues + spaces.substring(0,  10 - (info.open_issues.length));

        console.log(line);
    }
    api.repos.list()
        .then(function(repos) {

            printInfo({
                private: 'Type',
                name: 'Name',
                updated: 'Updated',
                open_issues: 'Open Issues'
            });

            printInfo({
                private: '-----------',
                name: '-------------------------------------------------',
                updated: '-------------------------',
                open_issues: '-----------'
            });

            var keys = Object.keys(repos);
            keys.map(function(key) {
                var info = repos[key];
                info.repos.map(function(repo) {

                    printInfo({
                        private: repo.private ? 'Private' : 'Public',
                        name: repo.owner.login + '/' + repo.name,
                        updated: utils.timeAgo(repo.pushed_at),
                        open_issues: '' + repo.open_issues
                    });

                    //console.log(JSON.stringify(repo, null, 2));
                });
            })

        })
        .catch(function(err) {
            console.error(err);
        });
}
