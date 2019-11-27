const rester = require('..');
const Controller = require('../restDocuments');
const SubController = require('../restSubDocuments');

const collectionName = 'Foo';

jest.mock('../restDocuments');
jest.mock('../restSubDocuments');

describe('rester unit tests', () => {
  describe('validateModelOptions', () => {
    it('should throw an error without a model', () => {
      expect(() =>
        rester().validateModelOptions(),
      ).toThrowError();
    });

    it('should throw an error on missing validation', () => {
      const get = jest.fn();
      expect(() =>
        rester().validateModelOptions({
          collection: { collectionName },
          schema: { get },
        }),
      ).toThrowError();
      expect(get).toHaveBeenCalled();
    });

    it('should return options', () => {
      const get = jest.fn().mockReturnValue(collectionName);
      expect(
        rester().validateModelOptions({
          collection: { collectionName },
          schema: { get },
        }),
      ).toMatchObject({
        collectionSingularName: collectionName,
        collectionPluralName: collectionName,
        restify: collectionName,
      });
    });
  });

  describe('configController', () => {
    it('should call app and Controller together', () => {
      const get = jest.fn().mockReturnValue('configured');
      const use = jest.fn();

      rester({ use }).configController({
        collection: { collectionName },
        schema: { get },
      });

      expect(use).toHaveBeenCalled();
      expect(Controller).toHaveBeenCalled();
    });
  });

  describe('configSubController', () => {
    it('should call app and iterate SubControllers', () => {
      const use = jest.fn();

      rester({ use }).configSubController({
        collection: { collectionName },
        schema: {
          childSchemas: [
            {
              model: {
                path: 'foo',
              },
            },
          ],
        },
      });

      expect(use).toHaveBeenCalled();
      expect(SubController).toHaveBeenCalled();
    });

    it('should not attempt subcontrollers', () => {
      const use = jest.fn();

      rester({ use }).configSubController({
        collection: { collectionName },
        schema: {
          childSchemas: [],
        },
      });

      expect(use).not.toHaveBeenCalled();
    });
  });
});
