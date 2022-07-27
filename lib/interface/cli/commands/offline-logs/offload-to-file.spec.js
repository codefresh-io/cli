/* eslint-disable no-unused-vars */
const moment = require('moment');
const { writeLogsToFile, checkRemnant } = require('./utils');
const fs = require('fs');

describe('offload-to-file', () => {
    describe('writeLogsToFile', () => {
        it('writes the input data to file', async () => {
            const upperBound = '2021-08-10';
            const lowerBound = '2021-08-01';
            const collection = 'logs';
            const pathMock = 'some/path';
            let writerResult = '';
            const expectedWrite = '[\n{"key1":"val"},\n{"key2":"val"},\n{"key3":"val"},\n{"key4":"val"}\n]';
            class LogsCursor {
                constructor() {
                    this.logs = [{ key1: 'val' }, { key2: 'val' }, { key3: 'val' }, { key4: 'val' }];
                    this.pointer = 0;
                    this.next = jest.fn(() => {
                        let currentDoc = null;
                        if (this.pointer < this.logs.length) {
                            currentDoc = this.logs[this.pointer];
                        }
                        this.pointer += 1;
                        return currentDoc;
                    });
                    this.isClosed = jest.fn(() => this.pointer > this.logs.length);
                }
            }
            const writerMock = {
                write: jest.fn((text) => {
                    writerResult = `${writerResult}${text}`;
                }),
                close: jest.fn(),
            };

            fs.createWriteStream = jest.fn(path => writerMock);
            await writeLogsToFile(upperBound, lowerBound, collection, new LogsCursor(), pathMock);
            expect(fs.createWriteStream.mock.calls.length).toBe(1);
            expect(fs.createWriteStream.mock.calls[0][0]).toContain(pathMock);
            expect(writerMock.write.mock.calls.length).toBe(6);
            expect(writerResult).toBe(expectedWrite);
            expect(writerMock.close.mock.calls.length).toBe(1);
        });
        it('creates the correct file name', async () => {
            const upperBound = '2021-08-10';
            const lowerBound = '2021-08-01';
            const collection = 'logs';
            const expectedPath = 'some/path/2021-08-01-2021-08-09-logs.json';
            const somePath = 'some/path';
            class LogsCursor {
                constructor() {
                    this.logs = [{ key1: 'val' }, { key2: 'val' }, { key3: 'val' }, { key4: 'val' }];
                    this.pointer = 0;
                    this.next = jest.fn(() => {
                        let currentDoc = null;
                        if (this.pointer < this.logs.length) {
                            currentDoc = this.logs[this.pointer];
                        }
                        this.pointer += 1;
                        return currentDoc;
                    });
                    this.isClosed = jest.fn(() => this.pointer > this.logs.length);
                }
            }
            const writerMock = {
                write: jest.fn(text => text),
                close: jest.fn(),
            };

            fs.createWriteStream = jest.fn(path => writerMock);
            await writeLogsToFile(upperBound, lowerBound, collection, new LogsCursor(), somePath);
            expect(fs.createWriteStream.mock.calls.length).toBe(1);
            expect(fs.createWriteStream.mock.calls[0][0]).toBe(expectedPath);
        });
        it('checks leap year date calculation', async () => {
            const upperBound = '2020-03-01';
            const lowerBound = '2020-02-01';
            const collection = 'logs';
            const expectedPath = 'some/path/2020-02-01-2020-02-29-logs.json';
            const somePath = 'some/path';
            class LogsCursor {
                constructor() {
                    this.logs = [{ key1: 'val' }, { key2: 'val' }, { key3: 'val' }, { key4: 'val' }];
                    this.pointer = 0;
                    this.next = jest.fn(() => {
                        let currentDoc = null;
                        if (this.pointer < this.logs.length) {
                            currentDoc = this.logs[this.pointer];
                        }
                        this.pointer += 1;
                        return currentDoc;
                    });
                    this.isClosed = jest.fn(() => this.pointer > this.logs.length);
                }
            }
            const writerMock = {
                write: jest.fn(text => text),
                close: jest.fn(),
            };

            fs.createWriteStream = jest.fn(path => writerMock);
            await writeLogsToFile(upperBound, lowerBound, collection, new LogsCursor(), somePath);
            expect(fs.createWriteStream.mock.calls.length).toBe(1);
            expect(fs.createWriteStream.mock.calls[0][0]).toBe(expectedPath);
        });
    });
    describe('checkRemnant', () => {
        it('checkes days remnant to make sure time range is not going off boundaries', () => {
            const lowerBound = '2020-08-01';
            const cutoffDateObj = moment('2020-08-01').add(1, 'days').startOf('day');
            const result = checkRemnant(lowerBound, cutoffDateObj);
            expect(result).toBe(1);
        });
    });
});
