const { compose, verify } = require('q3-core-composer');
const mongoose = require('../../config/mongoose');

const History = async (req, res) => {
  /**
   * @TODO
   * Permissions on history
   */
  try {
    const history = await mongoose.connection.db
      .collection('changelog')
      .find({})
      .sort({ date: -1 })
      .limit(250)
      .toArray();

    res.ok({
      history,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
};

History.authorization = [verify];
History.validation = [];

module.exports = compose(History);
