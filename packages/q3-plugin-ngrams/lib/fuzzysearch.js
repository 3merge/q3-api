const mongoose = require('mongoose');
const { clean, getGramCollection } = require('./helpers');

module.exports = async function fuzzysearch(term) {
  const terms = await getGramCollection(this)
    .aggregate([
      {
        $match: {
          $text: {
            $search: clean(term),
          },
        },
      },
      {
        $project: {
          _id: 0,
          origin: 1,
        },
      },
    ])
    .toArray();

  return terms.map((i) =>
    mongoose.Types.ObjectId(i.origin),
  );
};
