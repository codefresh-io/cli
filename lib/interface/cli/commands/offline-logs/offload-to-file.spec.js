const { writeLogsToFile } = require('./utils');
const fs = require('fs')

describe('offload-to-file', () => {
  describe('writeLogsToFile', () => {
    it('writes the input data to file', async () => {
      fs.writeFileSync = jest.fn((path, data) => {
        return {path, data};
      });
      const upperBound = '2021-08-10';
      const lowerBound = '2021-08-01';
      const collection = 'logs';
      const logsToArchive = [1, 2, 3, 4];
      const expectedStr = JSON.stringify(logsToArchive)
      const path = 'some/path';
      await writeLogsToFile(upperBound, lowerBound, collection, logsToArchive, path);
      expect(fs.writeFileSync.mock.calls.length).toBe(1);
      expect(fs.writeFileSync.mock.calls[0][0]).toContain(path);
      expect(fs.writeFileSync.mock.calls[0][1]).toBe(expectedStr);
    });
  });
});
