const { on } = require('q3-core-mailer');

exports.hasEventBeenCalled = (eventName) => {
  const cb = jest.fn();
  on(eventName, cb);

  /**
   * @NOTE
   * Call after the logic block to see if it was invoked.
   */
  return () => expect(cb).toHaveBeenCalled();
};

exports.delay = async (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
