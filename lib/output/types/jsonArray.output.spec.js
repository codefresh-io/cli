const CFError = require('cf-errors');
const Entity = require('../../logic/entities/Entity');
const output = require('./jsonArray.output');

describe('jsonArray output', () => {
    it('should return empty array for an empty array', () => {
        expect(output([])).toBe('[]');
    });

    it('should wrap single Entity into array', () => {
        const entity = new Entity();
        entity.info = { id: '1', status: 'ok' };

        const result = JSON.parse(output(entity));
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(entity.info);
    });

    it('should keep multiple Entities as array', () => {
        const entity1 = new Entity();
        entity1.info = { id: '1' };
        const entity2 = new Entity();
        entity2.info = { id: '2' };

        const result = JSON.parse(output([entity1, entity2]));
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(entity1.info);
        expect(result[1]).toEqual(entity2.info);
    });

    it('should throw CFError if element is not an Entity', () => {
        expect(() => output({ id: '1' })).toThrow(CFError);
        expect(() => output([new Entity(), {}])).toThrow(CFError);
    });
});
