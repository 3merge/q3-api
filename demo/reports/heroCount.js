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
        _id: '$role',
        characters: {
          $addToSet: '$name',
        },
      },
    },
    {
      $project: {
        _id: null,
        name: '$_id',
        count: {
          $size: '$characters',
        },
      },
    },
  ]).then((res) => ({
    name: 'Name',
    value: '# of Characters',
    data: res.map((item) => ({
      Name: item.name,
      '# of Characters': item.count,
    })),
  }));
