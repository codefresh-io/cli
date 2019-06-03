/* eslint-disable no-use-before-define,object-curly-newline,arrow-body-style */

const { sdk } = require('../../../../logic');

class AnalyzerLogic {

    static async analyze({ repoOwner, repoName, context }) {

        const repo = {
            repoOwner,
            repoName,
            git: context,
        };

        return sdk.pipelines.analyze({
            repo,
            type: 'git',
            source: 'api'
        });
    }

}

module.exports = AnalyzerLogic;
