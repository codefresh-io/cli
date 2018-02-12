const fs = require('fs');
const Promise = require('bluebird');
const recursive = Promise.promisify(require('recursive-readdir'));
const rimraf = Promise.promisify(require('rimraf'));
const copydir = require('copy-dir');
const path = require('path');
const _ = require('lodash');
const rp = require('request-promise');
const CFError = require('cf-errors');

const TEMP_DIR = path.resolve(__dirname, '../temp');
const TEMPLATE_DIR = path.resolve(__dirname);
const FILES_TO_IGNORE = ['index.js', 'content/pipelines v2/_index.md', 'content/pipelines v2/spec.md'];
const baseDir = path.resolve(TEMP_DIR, './content');
const ALLOW_BETA_COMMANDS = process.env.ALLOW_BETA_COMMANDS;

const hasSubCommands = async (command) => {
    const files = await recursive(path.resolve(__dirname, '../lib/interface/cli/commands'));

    let hasSubCommand = false;
    for (let j = 0; j < files.length && !hasSubCommand; j++) {
        const file = files[j];

        if (!file.endsWith('.cmd.js')) {
            continue;
        }

        const currCommand = require(file);
        if (_.isEqual(currCommand.parentCommand, command) && !command.isRoot()) {
            hasSubCommand = true;
        }
    }
    return hasSubCommand;
};

const getNestedCategories = async (command) => {
    let nestedCategory = '';
    const categoryArr = [];
    let docs = command.prepareDocs();
    categoryArr.push(docs.category);
    let currCommand = command.parentCommand;
    while (currCommand && await hasSubCommands(currCommand)) {
        docs = currCommand.prepareDocs();
        categoryArr.push(docs.category);
        currCommand = currCommand.parentCommand;
    }
    nestedCategory = categoryArr.pop();
    for (let i = categoryArr.length - 1; i >= 0; i--) {
        nestedCategory = nestedCategory + '/' + categoryArr[i];
    }
    if (!nestedCategory) {
        nestedCategory = command.prepareDocs().category;
    }
    return nestedCategory;
};

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
const createCommandFile = async (nestedCategory,docs) => {
    const dir = path.resolve(baseDir, `${(nestedCategory || 'undefined').toLowerCase()}`);

    const commandFilePath = path.resolve(dir, `./${docs.title}.md`);
    let finalFileString = '';
    let skeletonFileExists = false;
    if (fs.existsSync(commandFilePath)) {
        finalFileString = fs.readFileSync(commandFilePath, 'utf8');
        skeletonFileExists = true;
    }

    // HEADER STRING
    let headerString;
    if (docs.subCategory) {
        headerString = `+++\ntitle = "${docs.subCategory}"\n+++\n\n`;
    } else {
        headerString = `${docs.header}\n\n`;
    }

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
const updateCategoryFileContent = async (nestedCategory,command, existingContent) => {
    const docs = command.prepareDocs();
    const { category } = docs;
    let finalCategoryFileString = existingContent || "";

    if (!finalCategoryFileString) {
        const indexFile = path.resolve(baseDir, `./${(nestedCategory || 'undefined').toLowerCase()}/_index.md`);
        if (fs.existsSync(indexFile)) {
            finalCategoryFileString = fs.readFileSync(indexFile, 'utf8');
        }
    }

    // HEADER string
    const parent = command.parentCommand;
    let title = category;
    if (parent) {
        const parentdocs = parent.prepareDocs();
        if (parentdocs.subCategory) {
            title = parentdocs.subCategory;
        }
    }
    const headerString = `+++\ntitle = "${title}"\n+++\n\n`;
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

const upsertCategoryFolder = async (nestedCategory) => {
    const dir = path.resolve(baseDir, `${(nestedCategory || 'undefined').toLowerCase()}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

const createAutomatedDocs = async () => {

    const files = await recursive(path.resolve(__dirname, '../lib/interface/cli/commands'));

    const categories = {};
    const nestedCategories = {};

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

        // document only in case category field exists and there are no sub commands under it
        const docs = command.prepareDocs();
        const {category} = docs;
        if (!category || await hasSubCommands(command)) {
            continue;
        }

        nestedCategories[category] = await getNestedCategories(command);
        const nestedCategory = nestedCategories[category];
        categories[category] = await updateCategoryFileContent(nestedCategory,command, categories[category]);
        await upsertCategoryFolder(nestedCategory);
        await createCommandFile(nestedCategory,docs);
    }

    _.forEach(categories, async (content, category) => {
        await createCategoryFile(content, nestedCategories[category]);
    });
};

const createDownloadPage = async () => {
    let links = [];
    const RequestOptions = {
        url: 'https://api.github.com/repos/codefresh-io/cli/releases/latest',
        headers: {
            'User-Agent': 'codefresh-cli}',
        },
        json: true,
    };
    try {
        const res = await rp(RequestOptions);
        _.forEach(res.assets, ((asset) => {
            links.push(asset.browser_download_url);
        }));
        const commandFilePath = path.resolve(baseDir, './installation/download.md');
        const finalContent=
            '+++\n' +
            'title = "Download"\n' +
            'description = "asd"\n' +
            'date = "2017-04-24T18:36:24+02:00"\n' +
            'weight = 40\n' +
            '+++\n' +
            '\n' +
            'Navigate to <a href="https://github.com/codefresh-io/cli/releases" target="_blank">Official Releases</a>\n' +
            'and download the binary that matches your operating system.<br>\n' +
            'We currently support the following OS: <br>\n' +
            '<ul>\n' +
            '    <li><a href=' + links[0] + ' target="_blank">Linux-x64</a></li>\n' +
            '    <li><a href=' + links[1] + ' target="_blank">Macos-x64</a></li>\n' +
            '    <li><a href=' + links[2] + ' target="_blank">Windows-x64</a></li>\n' +
            '</ul> \n' +
            '\n' +
            'After downloading the binary, untar or unzip it and your are good to go.<br>\n' +
            'You can also add the binary to your system PATH environment variable so you can use it easily.\n' +
            '\n' +
            'If your operating system is missing please feel free to open us an issue in our <a href="https://github.com/codefresh-io/cli/issues" target="_blank">Github repository</a>.\n';
        fs.writeFileSync(commandFilePath, finalContent);
    } catch (err) {
        throw new CFError(err);
    }

};


const main = async () => {
    try {
        await deleteTempFolder();
        await copyTemplateToTmp();
        await createAutomatedDocs();
        await createDownloadPage();
    } catch (err) {
        console.error(err.stack);
    }
};

main();
