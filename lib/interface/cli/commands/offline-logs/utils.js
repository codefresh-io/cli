const readline = require("readline");
const moment = require("moment");

const { join } = require("path");
const fs = require("fs");

const defaultCollections = ["logs", "metadata"];

// converts date to objectId for filter purposes
const objectIdFromDate = function (date) {
  return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

const writeLogsToFile = function (
  upperBound,
  lowerBound,
  collection,
  logsToArchive,
  path
) {
  const date = moment(upperBound).subtract(1, "days");
  const fileDateRange = `${moment(lowerBound).format(
    "YYYY-MM-DD"
  )}-${date.format("YYYY-MM-DD")}`;
  const fileName = `${fileDateRange}-${collection}.json`;
  const absPath = join(path, fileName);
  const data = JSON.stringify(logsToArchive);
  fs.writeFileSync(absPath, data);
  console.info(`logs from collection '${collection}' were offloaded to '${absPath}'`)
};

const checkRemnant = function (lowerBound, cutoffDateObj) {
  return Math.ceil(cutoffDateObj.diff(lowerBound, "days"));
};



module.exports = {
  objectIdFromDate,
  writeLogsToFile,
  checkRemnant,
  defaultCollections,
};
