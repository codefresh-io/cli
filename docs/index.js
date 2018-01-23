const fs = require('fs');
const Promise = require('bluebird');
const recursive = Promise.promisify(require('recursive-readdir'));
const rimraf = Promise.promisify(require('rimraf'));
const copydir = require('copy-dir');
const path = require('path');
const _ = require('lodash');

const TEMP_DIR = path.resolve(__dirname, '../temp');
const TEMPLATE_DIR = path.resolve(__dirname);
const FILES_TO_IGNORE = ['index.js'];


const deleteTempFolder = async () => {
    await rimraf(TEMP_DIR);
};

const copyTemplateToTmp = async () => {
    const filePathsToIgnore = _.map(FILES_TO_IGNORE, (file) => {
        return path.resolve(TEMPLATE_DIR, file);
    });

    copydir.sync(TEMPLATE_DIR, TEMP_DIR, (stat, filepath) => {
        if (stat === 'file' && filePathsToIgnore.includes(filepath)) {
            return false;
        } else {
            return true;
        }
    });
};

const createAutomatedDocs = async () => {

    const files = await recursive(path.resolve(__dirname, '../lib/interface/cli/commands'));

    const baseDir = path.resolve(TEMP_DIR, './content');
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
        if (!docs.category) {
            return;
        }

        const { category } = docs;

        // create a directory according to the category
        const dir = path.resolve(baseDir, `${(category || 'undefined').toLowerCase()}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        let finalCategoryFileString = categories[category] || `+++\ntitle = "${category}"\n+++\n\n`;
        const formattedTitle = docs.title.replace(/\s+/g, '-')
            .toLowerCase();
        finalCategoryFileString += `### [${docs.title}](${formattedTitle})\n`;
        finalCategoryFileString += `\`${docs.command[0]}\`\n\n`;
        finalCategoryFileString += `${docs.description}\n\n`;
        finalCategoryFileString += `${docs.usage}\n\n`;
        categories[category] = finalCategoryFileString;


        // // create _index.md file if does not exist for the category
        // const indexFile = path.resolve(dir, '_index.md');
        // if (!fs.existsSync(indexFile)){
        //     fs.writeFileSync(indexFile, `+++\ntitle = "${category}"\n+++`);
        // }

        let finalFileString = '';

        finalFileString += `${docs.header}\n\n`;

        finalFileString += '### Description\n\n';
        finalFileString += `${docs.description}\n\n`;
        finalFileString += `${docs.usage}\n`;

        const mainCommand = docs.command.shift();
        finalFileString += `### Command\n\`${mainCommand}\``;

        if (docs.command.length) {
            finalFileString += `\n\n#### Aliases\n`;
            _.forEach(docs.command, (command) => {
                finalFileString += `\n\n\`${command}\``;
            });
        }
        finalFileString += '\n\n';

        if (docs.positionals.length) {
            finalFileString +=
                `### Arguments\n\nOption | Default | Description\n--------- | ----------- | -----------\n${docs.positionals}`;
        }

        if (docs.options) {
            let optionsString = '';
            _.forEach(docs.options, (options, group) => {
                optionsString = `### ${group}\n\nOption | Default | Description\n--------- | ----------- | -----------\n${options}` + optionsString;
            });
            finalFileString += optionsString;
        }

        if (docs.examples.length) {
            finalFileString +=
                `### Examples\n\n${docs.examples}`;
        }

        fs.writeFileSync(path.resolve(dir, `./${docs.title}.md`), finalFileString);
    });

    _.forEach(categories, (content, category) => {
        const indexFile = path.resolve(baseDir, `./${(category || 'undefined').toLowerCase()}/_index.md`);
        fs.writeFileSync(indexFile, content);
    });
};

const main = async () => {
    try {
        await deleteTempFolder();
        await copyTemplateToTmp();
        await createAutomatedDocs();
    } catch (err) {
        console.error(err.stack);
    }
};

main();
