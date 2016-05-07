var api         = require('../../lib/api'),
    spinner     = require("char-spinner"),
    colors      = require('colors'),
    biasedOpener = require('biased-opener');

var repo_id = process.argv.shift();
var sha = process.argv.shift();

var steps = [];
var messages = {};
var spinnerId;

var show_step = function(name) {
    if (spinnerId) {
        clearInterval(spinnerId);
        spinner.clear();
        console.log('  ✓   '.green + steps[steps.length-1]);
        spinnerId = null;
    }

    process.stdout.write('  •   ' + name + '\u000d');
    spinnerId = spinner({});
    steps.push(name);
    messages[name] = [];
};

var show_progress = function(progress_info) {

    var get_next_progress = function(info) {
        // console.log(JSON.stringify(info, null, 2));
        info.steps.map(function(step) {
            if (steps.indexOf(step.name) === -1) {
                show_step(step.name);

                if (step.name === 'success') {
                    biasedOpener(step.codeitUrl,{
                        preferredBrowsers: [
                            'chrome',
                            'chromium',
                            'safari',
                            'opera',
                            'firefox',
                            'ie'
                        ]
                    }, function(err) {
                    });
                    return;
                }
            }
            messages[step.name] = messages[step.name].concat(step.messages);
        });

        if (info.status === 'running') {
            return api.runtime.progress(progress_info.id)
                .then(function(info) {
                    setTimeout(function() {
                        get_next_progress(info);
                    }, 1000);
                });

        }
        return "";
    }

    return get_next_progress(progress_info);

}
// TODO - get settings

show_step('Getting repo information');

api.repos.show(repo_id)
    .then(function(repo) {

        // console.log(JSON.stringify(repo, null, 2));

        var data = {
            repoOwner: repo.owner.login,
            repoName: repo.name,
            sha: sha,
//            settings:,
            repoData: {
                private_repo: '' + repo.private,
                url: {
                    https: repo.html_url,
                    ssh: repo.ssh_url
                }
            },
            gitUrl: repo.ssh_url
        };

        return api.runtime.start(data)
    })
    .then(show_progress)
    .catch(function(err) {
        console.error(err);
    });
