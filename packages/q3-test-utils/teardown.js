module.exports = async () => {
  try {
    global.__MONGOD__.stop();
  } catch (e) {
    // noop
  }
};
