require('dotenv').config();

const moment = require('moment');
const { Character } = require('../models');

module.exports = async ($match) =>
  Character.aggregate([
    {
      $match,
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        newCharacters: { $sum: 1 },
      },
    },
  ]).then((res) => ({
    name: 'Month',
    value: 'Number of New Characters',
    data: res.map((item) => ({
      Month: moment()
        .month(item._id - 1)
        .format('MMMM'),
      'Number of New Characters': item.newCharacters,
    })),
  }));
