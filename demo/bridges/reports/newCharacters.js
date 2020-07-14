require('dotenv').config();

const moment = require('moment');
const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');
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

execChildProcess(
  Q3Instance,
  async ({ user, query }, trans) => {
    const fileName = 'characters-reports.csv';
    const data = await getNewCharactersByMonth({
      query,
    });

    const file = await Q3Instance.Notifications.upload(
      {
        name: fileName,
        user,
        data,
      },
      {
        month: trans('labels:month'),
        newCharacters: trans('labels:newCharacters'),
      },
    );

    return file;
  },
);

module.exports = getNewCharactersByMonth;
