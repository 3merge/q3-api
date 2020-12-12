const { on } = require('q3-core-scheduler');

exports.hasEventBeenCalled = (eventName) => {
  const cb = jest.fn();
  on('queued', cb);

  /**
   * @NOTE
   * Call after the logic block to see if it was invoked.
   */
  return () => expect(cb).toHaveBeenCalledWith(eventName);
};

exports.delay = async (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
