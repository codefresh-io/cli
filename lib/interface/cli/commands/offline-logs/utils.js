/* eslint-disable no-await-in-loop */
const readline = require('readline');
const moment = require('moment');
const { ObjectId } = require('mongodb');

const { join } = require('path');
const fs = require('fs');

const defaultCollections = ['logs', 'metadata'];

// converts date to objectId for filter purposes
function objectIdFromDate(date) {
    return `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`;
}

function createRangeStr(lowerBound, upperBound, collection) {
    const upperBoundDate = moment(upperBound).subtract(1, 'days');
    const fileDateRange = `${moment(lowerBound).format('YYYY-MM-DD')}-${upperBoundDate.format('YYYY-MM-DD')}`;
    return `${fileDateRange}-${collection}`;
}

async function writeLogsToFile(
    upperBound,
    lowerBound,
    collection,
    logsCursor,
    path,
) {
    const fileName = `${createRangeStr(lowerBound, upperBound, collection)}.json`;
    const absPath = join(path, fileName);
    const stream = fs.createWriteStream(absPath);
    let count = 0;
    stream.write('[');

    let comma = '';
    while (!logsCursor.isClosed()) {
        const doc = await logsCursor.next();
        if (doc) {
            const data = JSON.stringify(doc);
            stream.write(`${comma}\n${data}`);
            comma = ',';
            count += 1;
        } else {
            break;
        }
    }

    stream.write('\n]');
    stream.close();

    console.info(`${count} logs from collection '${collection}' were offloaded to '${absPath}'`);
}

function getMinDate(minLog) {
    const minLogId = new ObjectId(minLog._id);
    return moment(minLogId.getTimestamp()).startOf('day');
}

function checkRemnant(lowerBound, cutoffDateObj) {
    return Math.ceil(cutoffDateObj.diff(lowerBound, 'days'));
}

async function ensureIndex(database, collection) {
    const collectionObj = database.collection(collection);
    const indexName = 'accountId_1_jobId_1';

    const indexExist = await collectionObj.indexExists(indexName);

    if (indexExist) {
        console.info(`index '${indexName}' already exists in collection '${collection}'`);
        return;
    }

    const documentsCount = await collectionObj.estimatedDocumentCount();

    const queryStr = `There are approximately ${documentsCount} documents on collection '${collection}'. 
    do you want to create an index for it? (creating an index for a large collection may take a while, 
    but can improve performance on future read operations) [yes/no] `;

    const userInput = await this.getUserInput(queryStr);

    if (!userInput) {
        console.info(`skipping collection '${collection}'`);
        return;
    }

    await collectionObj.createIndex(
        { accountId: 1, jobId: 1 },
        { background: true },
    );
    console.info(`index '${indexName}' was created for collection '${collection}'`);
}

async function getUserInput(queryStr) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const questionAsync = query =>
        new Promise(resolve => rl.question(query, resolve));

    try {
        const userInput = (await questionAsync(queryStr)).toLowerCase();

        switch (userInput) {
            case 'yes':
            case 'y':
                return true;
            case 'no':
            case 'n':
                return false;
            default:
                console.warn('invalid input');
                return false;
        }
    } finally {
        rl.close();
    }
}

async function collectionExists(dbObject, targetCollection) {
    const collectionsObjectList = await dbObject.listCollections().toArray();
    const collectionsList = collectionsObjectList.map(object => object.name);
    return (collectionsList.indexOf(targetCollection) >= 0);
}

async function findMinLog(collectionObj, UpperBoundDateId) {
    const minLog = await collectionObj
        .find({ _id: { $lt: new ObjectId(UpperBoundDateId) } })
        .sort({ _id: 1 })
        .limit(1)
        .toArray();

    if (minLog.length === 0) {
        return undefined;
    }

    return minLog[0];
}

function checkCursorState(cursor, collection, targetCollection) {
    if (!cursor.cursorState.killed) {
        console.info(`logs from '${collection}' were archived to '${targetCollection}'`);
    } else {
        // eslint-disable-next-line no-multi-str
        throw new Error('Cursor error. Archiving operation may not be completed.\
        The old logs were not deleted from the source collection.');
    }
}

module.exports = {
    objectIdFromDate,
    writeLogsToFile,
    checkRemnant,
    ensureIndex,
    getUserInput,
    collectionExists,
    findMinLog,
    checkCursorState,
    createRangeStr,
    getMinDate,
    defaultCollections,
};
