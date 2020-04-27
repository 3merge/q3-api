const { compose, verify } = require('q3-core-composer');
const moment = require('moment');
const mongoose = require('mongoose');
const { exception } = require('q3-core-responder');
const { Permissions } = require('../../models');

const getRange = (d) => ({
  $gte: moment(d)
    .startOf('month')
    .format('YYYY-MM-DD hh:mm'),
  $lte: moment(d).endOf('month').format('YYYY-MM-DD hh:mm'),
});

const GetStats = async (
  { query: { collectionName }, body },
  res,
) => {
  if (
    !(await Permissions.findOne({
      coll: collectionName,
      op: 'Read',
    })
      .lean()
      .exec())
  )
    exception('Authorization')
      .msg('requiresGrantForThisStatistic')
      .throw();

  const Model = mongoose.models[collectionName];

  res.ok({
    latest: await Model.countDocuments({
      createdAt: getRange(),
      ...body,
    }),
    previous: await Model.countDocuments({
      createdAt: getRange(moment().subtract('1', 'months')),
      ...body,
    }),
  });
};

GetStats.authorization = [verify];

module.exports = compose(GetStats);
