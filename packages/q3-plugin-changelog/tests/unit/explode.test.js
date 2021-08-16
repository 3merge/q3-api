const explode = require('../../lib/explode');

describe('explode', () => {
  it('should explode arrays', () => {
    const out = explode({
      foo: 1,
      items: [
        {
          foo: 1,
          subitems: [
            {
              foo: 1,
            },
          ],
          codes: [
            {
              foo: 1,
            },
          ],
        },
      ],
    });

    expect(out).toEqual([
      { 'items.subitems.foo': 1 },
      { 'items.codes.foo': 1 },
      { 'items.foo': 1 },
      { foo: 1 },
    ]);
  });
});
