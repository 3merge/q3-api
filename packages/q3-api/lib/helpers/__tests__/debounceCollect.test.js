const { sum } = require('lodash');
const debounceCollect = require('../debounceCollect');

jest.useFakeTimers();

describe('debounceCollect', () => {
  it('should collect params during debounce', async () => {
    const fn = jest.fn().mockImplementation(sum);
    const debounced = debounceCollect(fn);
    debounced.on('data', (evt) => {
      expect(evt).toBe(6);
    });

    await debounced(1);
    await debounced(2);
    await debounced(3);

    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.lastCall[0]).toEqual([1, 2, 3]);
  });
});
