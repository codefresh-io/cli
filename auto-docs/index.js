const fs = require('fs');
const recursive = require('recursive-readdir');
const path = require('path');
const _ = require('lodash');


recursive(path.resolve(__dirname, '../lib/interface/cli/commands'), (err, files) => {

    const categories = {};

    _.forEach(files, (file) => {
        if (!file.endsWith('.cmd.js')) {
            return;
        }

        console.log(file);
        const command = require(file);

        // dont document beta commands currently
        if (command.isBetaCommand()) {
            return;
        }

        const docs = command.prepareDocs();

        const { category } = docs;


        let finalFileString = categories[category] || '';

        if (!finalFileString) {
            finalFileString += `${docs.header}\n\n`;
            finalFileString += `# ${docs.category}\n\n`;
        }

        finalFileString += `## ${docs.description}\n\n`;
        finalFileString += `### Command\n\`${docs.command}\`\n\n`;
        finalFileString += `${docs.cliDescription}\n`;

        if (docs.positionals.length) {
            finalFileString += `### Positionals\n\nOption | Default | Description\n--------- | ----------- | -----------\n${docs.positionals}`;
        }

        if (docs.options.length) {
            finalFileString += `### Options\n\nOption | Default | Description\n--------- | ----------- | -----------\n${docs.options}`;
        }

        categories[category] = finalFileString;
    });


    _.forEach(categories, (value, key) => {
        fs.writeFileSync(path.resolve(__dirname, `../docs-template/content/${key}.md`), value);
    });

});
