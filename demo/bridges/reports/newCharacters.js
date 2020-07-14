const moment = require('moment');
const { Character } = require('../../models');

const getNewCharactersByMonth = async ({
  query: $match,
}) => {
  return Character.aggregate([
    {
      $match,
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        newCharacters: { $sum: 1 },
      },
    },
  ]).then((res) =>
    res.map((item) => ({
      month: moment()
        .month(item._id - 1)
        .format('MMMM'),
      newCharacters: item.newCharacters,
    })),
  );
};

module.exports = getNewCharactersByMonth;
