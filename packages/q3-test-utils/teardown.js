module.exports = async () => {
  try {
    global.__MONGOD__.stop();
    delete process.env.CONNECTION;
  } catch (e) {
    // noop
  }
};
