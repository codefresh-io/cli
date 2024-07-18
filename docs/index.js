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
const FILES_TO_IGNORE = ['index.js', 'docs.spec.js'];
const baseDir = path.resolve(TEMP_DIR, './content');
const ALLOW_BETA_COMMANDS = process.env.ALLOW_BETA_COMMANDS;
const categoriesOrder = {
    completion: 30,
    authentication: 31,
    'operate on resources': 32,
    pipelines: 40,
    'pipelines v2 (beta)': 42,
    projects: 45,
    builds: 50,
    contexts: 70,
    images: 80,
    triggers: 90,
    environments: 100,
    compositions: 110,
    'helm repos': 111,
    'predefined pipelines': 120,
    'cli config': 121,
    teams: 130,
    more: 150,
};


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
const getWeight = async (command) => {
    const docs = command.prepareDocs();
    let weight = 0;
    if (docs.weight) {
        return docs.weight;
    }
    else {
        let parent = command.getParentCommand();
        while (parent && !parent.prepareDocs().weight) {
            parent = parent.getParentCommand();
        }
        if (parent) {
            weight = parent.prepareDocs().weight;
        }
        return weight;
    }
};

const createCommandFile = async (nestedCategory, command) => {
    const docs = command.prepareDocs();
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
    const weight = await getWeight(command);
    if (docs.subCategory) {
        headerString = `+++\ntitle = "${docs.subCategory}"\nweight = ${weight || 100}\n+++\n\n`;
    } else {
        headerString = `+++\ntitle = "${docs.title}"\nweight = ${weight || 100}\n+++\n\n`;
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
        const argumentsString = `### Arguments\n\nOption | Alias | Default | Description\n--------- | --------- | ----------- | -----------\n${docs.positionals}`;
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
            optionsString = `### ${group}\n\nOption | Alias | Type | Default | Description\n--------- | --------- | --------- |----------- | -----------\n${options}` + optionsString;
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
const updateCategoryFileArray = async (nestedCategory, command, existingContent) => {
    const docs = command.prepareDocs();
    const { category } = docs;
    const finalCategoryArr = existingContent || {};

    // HEADER string
    const parent = command.parentCommand;
    let title = category;
    if (parent) {
        const parentdocs = parent.prepareDocs();
        if (parentdocs.subCategory) {
            title = parentdocs.subCategory;
        }
    }
    const indexFile = path.resolve(baseDir, `./${(nestedCategory || 'undefined').toLowerCase()}/_index.md`);
    finalCategoryArr.indexPath = indexFile;

    if (!_.isEqual(title.toLowerCase(), 'more') && !_.isEqual(title.toLowerCase(), 'operate on resources')) {
        const headerString = `+++\ntitle = "${title}"\nweight = ${categoriesOrder[title.toLowerCase()] || 100}\n+++\n\n`;
        finalCategoryArr.header = headerString;
    }
    else {
        finalCategoryArr.header = '';
    }

    let commandString = '';
    const formattedTitle = docs.title.replace(/\s+/g, '-')
        .toLowerCase();
    commandString += `### [${docs.title}](${formattedTitle})\n`;
    commandString += `\`${docs.command[0]}\`\n\n`;
    commandString += `${docs.description}\n\n`;
    commandString += `${docs.usage}\n\n`;

    const newCmd = {};
    finalCategoryArr.category = category;
    newCmd.weight = await getWeight(command);
    newCmd.content = commandString;
    if (!finalCategoryArr.commands) {
        finalCategoryArr.commands = [];

    }
    finalCategoryArr.commands.push(newCmd);


    return finalCategoryArr;
};


/**
 * updates the category main file with a specific command
 * possible extensions are: HEADER, COMMANDS
 */
const updateCategoryFileContent = async (finalContent) => {
    let finalCategoryFileString = '';
    const indexFile = finalContent.indexPath;
    if (fs.existsSync(indexFile)) {
        finalCategoryFileString = fs.readFileSync(indexFile, 'utf8');
    }
    finalCategoryFileString += finalContent.header;
    const commandArr = finalContent.commands;
    commandArr.sort((a, b) => {
        return a.weight - b.weight;
    });

    _.forEach(commandArr, (command) => {
        finalCategoryFileString += command.content;
    });

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
        const { category } = docs;
        if (!category || await hasSubCommands(command)) {
            continue;
        }

        nestedCategories[category] = await getNestedCategories(command);
        const nestedCategory = nestedCategories[category];
        categories[category] = await updateCategoryFileArray(nestedCategory, command, categories[category]);
        await upsertCategoryFolder(nestedCategory);
        await createCommandFile(nestedCategory, command);
    }

    let categoriesFinalContent = {};
    for (let command in categories) {
        let f = categories[command];
        categoriesFinalContent[f.category] = await updateCategoryFileContent(f);
    }

    _.forEach(categoriesFinalContent, async (content, category) => {
        await createCategoryFile(content, nestedCategories[category]);
    });
};

const createDownloadPage = async () => {
    const RequestOptions = {
        url: 'https://api.github.com/repos/codefresh-io/cli/releases/latest',
        headers: {
            'User-Agent': 'codefresh-cli-build',
        },
        json: true,
    };
    try {
        // response example https://docs.github.com/en/rest/releases/releases#get-the-latest-release
        const { assets = [] } = await rp(RequestOptions);

        const getDownloadUrlFromAssets = (nameRegex) => assets.find((a) => a.name.match(nameRegex)).browser_download_url;
        const downloadLinks = [
            {
                label: 'Alpine-x64',
                downloadUrl: getDownloadUrlFromAssets(/alpine-x64/),
            },
            {
                label: 'Linux-x64',
                downloadUrl: getDownloadUrlFromAssets(/linux-x64/),
            },
            {
                label: 'Macos-x64',
                downloadUrl: getDownloadUrlFromAssets(/macos-x64/),
            },
            {
                label: 'Windows-x64',
                downloadUrl: getDownloadUrlFromAssets(/win-x64/),
            },
            {
                label: 'Alpine-arm64',
                downloadUrl: getDownloadUrlFromAssets(/alpine-arm64/),
            },
            {
                label: 'Linux-arm64',
                downloadUrl: getDownloadUrlFromAssets(/linux-arm64/),
            },
        ];

        const commandFilePath = path.resolve(baseDir, './installation/download.md');
        const finalContent =
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
                downloadLinks.map(({ label, downloadUrl }) =>
                    `    <li><a href='${downloadUrl}' target="_blank">${label}</a></li>`).join('\n') +
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

const generateDocs = async () => {
    await deleteTempFolder();
    await copyTemplateToTmp();
    await createAutomatedDocs();
    await createDownloadPage();
};

const main = async () => {
    try {
        await generateDocs();
    } catch (err) {
        console.error(err.stack);
    }
};

if (require.main === module) {
    main();
} else {
    module.exports = generateDocs;
}
