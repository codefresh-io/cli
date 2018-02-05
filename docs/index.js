const fs = require('fs');
const Promise = require('bluebird');
const recursive = Promise.promisify(require('recursive-readdir'));
const rimraf = Promise.promisify(require('rimraf'));
const copydir = require('copy-dir');
const path = require('path');
const _ = require('lodash');

const TEMP_DIR = path.resolve(__dirname, '../temp');
const TEMPLATE_DIR = path.resolve(__dirname);
const FILES_TO_IGNORE = ['index.js', 'content/pipelines v2/_index.md', 'content/pipelines v2/spec.md'];
const baseDir = path.resolve(TEMP_DIR, './content');
const ALLOW_BETA_COMMANDS = process.env.ALLOW_BETA_COMMANDS;


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

/**
 * creates a specific command content and file
 * in case the file already exists in the base docs folder it will extend it
 * possible extensions are: HEADER, DESCRIPTION, COMMANDS, ARGUMENTS, OPTIONS
 */
const createCommandFile = async (docs) => {
    const { subCategory , category } = docs;
    const dir = path.resolve(baseDir, `${(category || 'undefined').toLowerCase()}`, `${(subCategory || '').toLowerCase()}`);

    const commandFilePath = path.resolve(dir, `./${docs.title}.md`);
    let finalFileString = '';
    let skeletonFileExists = false;
    if (fs.existsSync(commandFilePath)) {
        finalFileString = fs.readFileSync(commandFilePath, 'utf8');
        skeletonFileExists = true;
    }

    // HEADER STRING
    const headerString = `${docs.header}\n\n`;
    if (skeletonFileExists) {
        finalFileString = finalFileString.replace('{{HEADER}}', headerString);
    } else {
        finalFileString += headerString;
    }

    // DESCRIPTION STRING
    let descriptionString = '### Description\n\n';
    descriptionString += `${docs.description}\n\n`;
    descriptionString += `${docs.usage}\n`;
    if (skeletonFileExists) {
        finalFileString = finalFileString.replace('{{DESCRIPTION}}', descriptionString);
    } else {
        finalFileString += descriptionString;
    }

    // COMMAND string
    const mainCommand = docs.command.shift();
    let commandsString = `### Command\n\`${mainCommand}\``;
    if (docs.command.length) {
        commandsString += `\n\n#### Aliases\n`;
        _.forEach(docs.command, (command) => {
            commandsString += `\n\n\`${command}\``;
        });
    }
    commandsString += '\n\n';

    if (skeletonFileExists) {
        finalFileString = finalFileString.replace('{{COMMANDS}}', commandsString);
    } else {
        finalFileString += commandsString;
    }

    // ARGUMENTS string
    docs.command.shift();
    if (docs.positionals.length) {
        const argumentsString = `### Arguments\n\nOption | Default | Description\n--------- | ----------- | -----------\n${docs.positionals}`;
        if (skeletonFileExists) {
            finalFileString = finalFileString.replace('{{ARGUMENTS}}', argumentsString);
        } else {
            finalFileString += argumentsString;
        }
    }

    // OPTIONS string
    if (docs.options) {
        let optionsString = '';
        _.forEach(docs.options, (options, group) => {
            optionsString = `### ${group}\n\nOption | Default | Description\n--------- | ----------- | -----------\n${options}` + optionsString;
        });
        if (skeletonFileExists) {
            finalFileString = finalFileString.replace('{{OPTIONS}}', optionsString);
        } else {
            finalFileString += optionsString;
        }
    }

    // EXAMPLES string
    if (docs.examples.length) {
        const examplesString = `### Examples\n\n${docs.examples}`;
        if (skeletonFileExists) {
            finalFileString = finalFileString.replace('{{EXAMPLES}}', examplesString);
        } else {
            finalFileString += examplesString;
        }
    }

    fs.writeFileSync(commandFilePath, finalFileString);
};

const createCategoryFile = async (content, category) => {
    const indexFile = path.resolve(baseDir, `./${(category || 'undefined').toLowerCase()}/_index.md`);
    const finalContent = content.replace('{{COMMANDS}}', '');
    fs.writeFileSync(indexFile, finalContent);
};

/**
 * updates the category main file with a specific command
 * possible extensions are: HEADER, COMMANDS
 */
const updateCategoryFileContent = async (docs, existingContent) => {
    const { subCategory,category } = docs;
    const currCat = subCategory || category;
    let finalCategoryFileString = existingContent || "";

    if (!finalCategoryFileString) {
        const indexFile = path.resolve(baseDir, `./${(category || 'undefined').toLowerCase()}`, `./${(subCategory || '').toLowerCase()}/_index.md`);
        if (fs.existsSync(indexFile)) {
            finalCategoryFileString = fs.readFileSync(indexFile, 'utf8');
        }
    }

    // HEADER string
    const headerString = `+++\ntitle = "${currCat}"\n+++\n\n`;
    finalCategoryFileString = finalCategoryFileString.replace('{{HEADER}}', headerString);
    if (!finalCategoryFileString) {
        finalCategoryFileString = headerString;
    }

    // COMMANDS string
    let commandString = '';
    const formattedTitle = docs.title.replace(/\s+/g, '-')
        .toLowerCase();
    commandString += `### [${docs.title}](${formattedTitle})\n`;
    commandString += `\`${docs.command[0]}\`\n\n`;
    commandString += `${docs.description}\n\n`;
    commandString += `${docs.usage}\n\n`;

    if (finalCategoryFileString.indexOf('{{COMMANDS}}') !== -1) {
        finalCategoryFileString = finalCategoryFileString.replace('{{COMMANDS}}', `${commandString}\n\n{{COMMANDS}}`);
    } else {
        finalCategoryFileString += commandString;
    }

    return finalCategoryFileString;
};

const upsertCategoryFolder = async (category,subCategory) => {
    const dir = path.resolve(baseDir, `${(category || 'undefined').toLowerCase()}`,`${(subCategory || '').toLowerCase()}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

const createAutomatedDocs = async () => {

    const files = await recursive(path.resolve(__dirname, '../lib/interface/cli/commands'));

    const categories = {};
    const subcategories = {};
    const categoriesOfSub = {};

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.endsWith('.cmd.js')) {
            continue;
        }

        console.log(file);
        const command = require(file);

        // dont document beta commands currently
        if (command.isBetaCommand() && !ALLOW_BETA_COMMANDS) {
            continue;
        }

        // document only in case category field exists
        const docs = command.prepareDocs();
        const { subCategory, category } = docs;
        if (!category) {
            continue;
        }

        if (!subCategory) {
            categories[category] = await updateCategoryFileContent(docs, categories[category]);
            await upsertCategoryFolder(category, subCategory);
            await createCommandFile(docs);
        }
        else{
            categoriesOfSub[subCategory] = category;
            subcategories[subCategory] = await updateCategoryFileContent(docs, subcategories[subCategory]);
            await upsertCategoryFolder(category, subCategory);
            await createCommandFile(docs);
        }
    }

    _.forEach(categories, async (content, category) => {
        await createCategoryFile(content, category);
    });
    _.forEach(subcategories, async (content, subCategory) => {
        await createCategoryFile(content, categoriesOfSub[subCategory] + '/' + subCategory);
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
