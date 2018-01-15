const fs = require('fs');
const recursive = require('recursive-readdir');
const path = require('path');
const _ = require('lodash');


recursive(path.resolve(__dirname, '../lib/interface/cli/commands'), (err, files) => {

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

        // create a directory according to the category
        const dir = path.resolve(__dirname, `../docs-template/content/${(category || 'undefined').toLowerCase()}`);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        // create _index.md file if does not exist for the category
        const indexFile = path.resolve(dir, '_index.md');
        if (!fs.existsSync(indexFile)){
            fs.writeFileSync(indexFile, `+++\ntitle = "${category}"\n+++`);
        }

        let finalFileString = '';

        finalFileString += `${docs.header}\n\n`;
        finalFileString += `### Command\n\`${docs.command}\`\n\n`;
        finalFileString += `${docs.description}\n`;

        if (docs.positionals.length) {
            finalFileString += `### Positionals\n\nOption | Default | Description\n--------- | ----------- | -----------\n${docs.positionals}`;
        }

        if (docs.options.length) {
            finalFileString += `### Options\n\nOption | Default | Description\n--------- | ----------- | -----------\n${docs.options}`;
        }


        fs.writeFileSync(path.resolve(dir, `./${docs.title}.md`), finalFileString);
    });
});
