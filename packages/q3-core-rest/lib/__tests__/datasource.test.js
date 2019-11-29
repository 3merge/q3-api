const Model = require('q3-test-utils/helpers/modelMock');
const DataSource = require('../datasource');

beforeAll(() => {
  Model.schema.options = {
    collectionPluralName: 'foos',
    collectionSingluarName: 'foo',
  };
});

describe('Datasource', () => {
  describe('$mkt', () => {
    it('should return undefined', () => {
      const resp = new DataSource(Model).$mkt('get', [
        'foo',
        jest.fn(),
      ]);

      expect(resp).toBeUndefined();
    });

    it('should return a function', () => {
      Model.schema.get.mockReturnValue('get');
      const resp = new DataSource(Model).$mkt('get', [
        'foo',
        jest.fn(),
      ]);

      expect(typeof resp).toMatch('function');
    });
  });
});
