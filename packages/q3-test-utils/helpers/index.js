const willThrowException = async (fn, name) => {
  try {
    await fn;
    throw new Error('Initial function passed unexpectedly');
  } catch (e) {
    expect(e.name).toMatch(name);
  }
};

module.exports = { willThrowException };
