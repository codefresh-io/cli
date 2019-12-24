const _ = require('lodash');
const helper = require('./image');
const moment = require('moment');
const creatingEntities = require('./creatingEntities');

const { extractImages } = helper;

jest.mock('../../../logic/entities/Image', () => class {
    constructor(props) {
        Object.assign(this, props);
    }
});

describe('helpers unit tests', () => {
    describe('creating entites', () => {
        const request = require('requestretry');
        beforeEach(async () => {
            request.__reset();
            request.mockClear();
            await configureSdk(); // eslint-disable-line
        });
        const entities = creatingEntities({});
        it('should be an Object', () => expect(entities instanceof Object).toBe(true));
        it('should have some size', () => expect(_.size(entities)).not.toBe(0));
        for (const entity in entities) {
            it(`${entity} should be a function`, () => expect(entities[entity] instanceof Function).toBe(true));
            it(`${entity} should be promise`, () => expect(entities[entity]().catch(() => null) instanceof Promise).toBe(true));
        }
    });

    describe('images', () => {
        describe('#extractImages', () => {
            beforeAll(() => {
                helper.extractFieldsForImageEntity = jest.fn((image, tag) => ({ tag: tag.tag || tag }));
            });

            it('should wrap data into array if only one image passed', () => {
                const image = {
                    tags: [{ tag: 'test', registry: 'r.cfcr.io' }],
                };
                expect(extractImages(image)).toEqual([{ tag: 'test' }]);
            });

            it('should extract image tags as separate images', () => {
                expect(extractImages([
                    {
                        tags: [{ tag: 'banana' }, { tag: 'beer', registry: 'r.cfcr.io' }],
                    },
                    {
                        tags: [{ tag: 'banana' }, { tag: 'beer', registry: 'r.cfcr.io' }],
                    },
                ])).toEqual([
                    { tag: 'banana' },
                    { tag: 'beer' },
                    { tag: 'banana' },
                    { tag: 'beer' },
                ]);
            });

            it('should filter tags by registries', () => {
                expect(extractImages([
                    {
                        tags: [
                            { tag: 'banana', registry: 'filtered' },
                            { tag: 'beer', registry: 'r.cfcr.io' },
                        ],
                    },
                    {
                        tags: [
                            { tag: 'banana', registry: 'r.cfcr.io' },
                            { tag: 'beer', registry: 'filtered' },
                        ],
                    },
                ], ['r.cfcr.io'])).toEqual([
                    { tag: 'beer' },
                    { tag: 'banana' },
                ]);
            });

            it('should filter images tagged as "volume"', () => {
                expect(extractImages([
                    {
                        tags: [
                            { tag: 'volume' },
                        ],
                    },
                ])).toEqual([]);
            });

            it('should add <none> literal to image if it has no tags', () => {
                expect(extractImages([
                    {
                        tags: [],
                    },
                ])).toEqual([{ tag: '<none>' }]);
            });

            it('should sort images by date created DESC', () => {
                helper.extractFieldsForImageEntity = jest.fn(({ created }) => ({ info: { created } }));
                const images = [
                    {
                        created: new Date('2019-04-22T14:30:18.742Z'),
                    },
                    {
                        created: new Date('2019-04-22T14:40:18.741Z'),
                    },
                    {
                        created: new Date('2019-04-22T14:45:18.742Z'),
                    },
                ];
                const extracted = extractImages(images);
                const extractedDates = _.map(extracted, i => i.info.created);
                const initialSortedDates = _.chain(images)
                    .orderBy(['created'], ['desc'])
                    .map(i => i.created)
                    .value();
                expect(extractedDates).toEqual(initialSortedDates);
            });
        });
    });
});
