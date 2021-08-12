const moment = require('moment')
const { writeLogsToFile, checkRemnant } = require('./utils');
const fs = require('fs')

describe('offload-to-file', () => {
  describe('writeLogsToFile', () => {
    it('writes the input data to file', () => {
      fs.writeFileSync = jest.fn((path, data) => {
        return {path, data};
      });
      const upperBound = '2021-08-10';
      const lowerBound = '2021-08-01';
      const collection = 'logs';
      const logsToArchive = [1, 2, 3, 4];
      const expectedStr = JSON.stringify(logsToArchive)
      const path = 'some/path';
      writeLogsToFile(upperBound, lowerBound, collection, logsToArchive, path);
      expect(fs.writeFileSync.mock.calls.length).toBe(1);
      expect(fs.writeFileSync.mock.calls[0][0]).toContain(path);
      expect(fs.writeFileSync.mock.calls[0][1]).toBe(expectedStr);
    });
    it('creates the correct file name', () => {
      fs.writeFileSync = jest.fn((path, data) => {
        return {path, data};
      });
      const upperBound = '2021-08-10';
      const lowerBound = '2021-08-01';
      const collection = 'logs';
      const logsToArchive = [1, 2, 3, 4];
      const expectedPath = 'some/path/2021-08-01-2021-08-09-logs.json'
      const path = 'some/path';
      writeLogsToFile(upperBound, lowerBound, collection, logsToArchive, path);
      expect(fs.writeFileSync.mock.calls.length).toBe(1);
      expect(fs.writeFileSync.mock.calls[0][0]).toBe(expectedPath);
    });
    it('checks leap year date calculation', () => {
      fs.writeFileSync = jest.fn((path, data) => {
        return {path, data};
      });
      const upperBound = '2020-03-01';
      const lowerBound = '2020-02-01';
      const collection = 'logs';
      const logsToArchive = [1, 2, 3, 4];
      const expectedPath = 'some/path/2020-02-01-2020-02-29-logs.json'
      const path = 'some/path';
      writeLogsToFile(upperBound, lowerBound, collection, logsToArchive, path);
      expect(fs.writeFileSync.mock.calls.length).toBe(1);
      expect(fs.writeFileSync.mock.calls[0][0]).toBe(expectedPath);
    });
  });
  describe('checkRemnant', () => {
    it('checkes days remnant to make sure time range is not going off boundaries', () => {
      const lowerBound = '2020-08-01';
      const cutoffDateObj = moment('2020-08-01').add(1, 'days').startOf("day");
      const result = checkRemnant(lowerBound, cutoffDateObj);
      expect(result).toBe(1);
    });
  });
});
