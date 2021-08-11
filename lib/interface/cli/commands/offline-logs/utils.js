const moment = require('moment');

const { join } = require('path');
const fs = require('fs');

// converts date to objectId for filter purposes
const objectIdFromDate = function (date) {
	return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

const writeLogsToFile = async function(upperBound, lowerBound, collection, logsToArchive, path) {
  const date = moment(upperBound).subtract(1, "days")
  const fileDateRange = `${moment(lowerBound).format('YYYY-MM-DD')}-${date.format('YYYY-MM-DD')}`
  const fileName = `${fileDateRange}-${collection}.json`;
  const absPath = join(path, fileName);
  const data = JSON.stringify(logsToArchive);
  fs.writeFileSync(absPath, data);
};

const checkRemnant = async function(lowerBound, chunkSize, cutoffDateObj) {
  const date1 = moment(lowerBound).add( chunkSize, 'days')
  return Math.ceil(cutoffDateObj.diff(date1 , "days" ));
}

module.exports = {objectIdFromDate, writeLogsToFile, checkRemnant};
