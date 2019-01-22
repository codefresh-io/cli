const _ = require('lodash');

const { Formatter } = require('../Formatter');
const Style = require('../Style');
const output = require('./table.output');
const Entity = require('../../logic/entities/Entity');

const mockDefaultEntityDateFormatter = Formatter.build()
    .style('date', Style.date);

const TESTED_DATE = '2019-01-16';
const TESTED_TIME = '02:00:00';
const TESTED_DATETIME = `${TESTED_DATE}, ${TESTED_TIME}`;
const TESTED_DATE_OBJ = new Date(TESTED_DATETIME);
let mockConfig = {};

jest.mock('../../logic/cli-config/Manager', () => {
    return {
        config: () => (mockConfig),
    };
});


jest.mock('../formatters/index', () => {
    const get = () => mockDefaultEntityDateFormatter;
    return {
        FormatterRegistry: { get },
    };
});

class TestEntity extends Entity {
    constructor(data) {
        super();
        this.info = data;
        this.defaultColumns = ['date'];
    }

}


// todo: add other tests on coverage
describe('table output', () => {
    describe('date format', () => {
        it('should apply default entity date format when no pretty flag and no date format are passed', () => {
            const argv = {}; // no pretty flag
            mockConfig = { output: { pretty: false, dateFormat: 'default' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe(TESTED_DATE);
        });

        it('should apply default entity date format when pretty flag and no date format are passed', () => {
            const argv = { pretty: true };
            mockConfig = { output: { pretty: false, dateFormat: 'default' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe(TESTED_DATE);
        });

        it('should apply default entity date format when pretty flag on cli-config and no date format is passed', () => {
            const argv = {};
            mockConfig = { output: { pretty: true, dateFormat: 'default' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe(TESTED_DATE);
        });

        it('should apply date format when it\'s passed', () => {
            const argv = { dateFormat: 'datetime' };
            mockConfig = { output: { pretty: false, dateFormat: 'default' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe(TESTED_DATETIME);
        });

        it('should apply date format when it\'s inside cli-config and not at argv', () => {
            const argv = {};
            mockConfig = { output: { pretty: false, dateFormat: 'datetime' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe(TESTED_DATETIME);
        });

        it('should apply date format at argv over cli-config date-format', () => {
            const argv = { dateFormat: 'date' };
            mockConfig = { output: { pretty: false, dateFormat: 'datetime' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe(TESTED_DATE);
        });

        it('should be able to apply custom date-format', () => {
            const argv = { dateFormat: 'YYYY-MM' };
            mockConfig = { output: { pretty: false, dateFormat: 'datetime' } };
            const table = output(new TestEntity({ date: TESTED_DATE_OBJ }), argv);
            expect(table.split('\n')[1]).toBe('2019-01');
        });
    });
});
