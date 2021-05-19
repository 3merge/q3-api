const connectToQueryParser = require('../../lib/helpers/connectToQueryParser');

describe('connectToQueryParser', () => {
  it('should return data unmodified', () => {
    const obj = { foo: 1 };
    expect(connectToQueryParser(obj)).toEqual(obj);
  });

  it('should assign query', () => {
    const obj = { originalUrl: '/example?' };
    expect(connectToQueryParser(obj)).toHaveProperty(
      'query',
    );
  });

  it('should map and delete special query params', () => {
    const obj = {
      originalUrl:
        '/io?age<=30&createdAt>2021-01-01&template=foo&ids=1,2,3',
    };
    expect(connectToQueryParser(obj)).toHaveProperty(
      'query',
      {
        age: { $lte: 30 },
        createdAt: { $gt: new Date('2021-01-01') },
        _id: { $in: [1, 2, 3] },
      },
    );
  });
});
