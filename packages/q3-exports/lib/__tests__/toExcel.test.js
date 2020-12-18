const toExcel = require('../toExcel');

const TEST_KEY = 'test';

describe('getHeader', () => {
  it('should keys from first object in array', () =>
    expect(toExcel.getHeader([{ foo: 1 }])).toEqual([
      'foo',
    ]));

  it('should map to excel column props', () => {
    expect(toExcel.mapColumns([TEST_KEY])[0]).toEqual(
      expect.objectContaining({
        width: expect.any(Number),
        header: TEST_KEY.toUpperCase(),
        key: TEST_KEY,
      }),
    );
  });

  it('should assign title styles', () => {
    const mergeCells = jest.fn();
    const getRow = jest.fn().mockReturnValue({});
    const out = toExcel.makeTitle(
      { mergeCells, getRow },
      TEST_KEY,
    );

    expect(getRow).toHaveBeenCalledWith(1);
    expect(mergeCells).toHaveBeenCalledWith(
      'A1',
      expect.any(String),
    );

    expect(out).toHaveProperty('values', [TEST_KEY]);
    expect(out).toHaveProperty('font');
  });
});
