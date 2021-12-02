const Scheduler = require('q3-core-scheduler');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const moment = require('moment');
const {
  map,
  isNumber,
  get,
  find,
  size,
} = require('lodash');
const aws = require('../../config/aws');

exports.calculateAverageDuration = async (
  name = { $exists: true },
) => {
  const averages = await Scheduler.__$db.aggregate([
    {
      $match: {
        status: 'Done',
        name,
      },
    },
    {
      $group: {
        _id: '$name',
        average: {
          $avg: '$duration',
        },
      },
    },
  ]);

  return ({ due, name: singleName }) =>
    moment(due)
      .add(
        get(
          find(averages, (av) => av._id === singleName),
          'average',
          0,
        ),
        'ms',
      )
      .toISOString();
};

exports.getDuration = ({ duration = 0 }) =>
  isNumber(duration) ? Math.floor(duration / 1000) : 0;

exports.getResolvedStatus = ({ locked, status }) => {
  if (status === 'Queued')
    return locked ? 'In Progress' : 'Scheduled';

  return status;
};

exports.getType = ({ name }) =>
  String(name).includes('@') ? 'Recurring' : 'Once';

exports.getImportedFile = ({ payload }) => {
  let data;

  try {
    data = JSON.parse(payload);
  } catch (e) {
    data = {};
  }
  const a = aws();
  return map(get(data, 'buckets', []), a.getPrivate);
};

exports.checkOp = (queue, user, op = 'Update') => {
  if (!queue)
    exception('NotFound').msg('taskNotFound').throw();

  const grant = new Grant(user)
    .can(op)
    .on('queues')
    .test(queue);

  if (!grant || !grant.fields || !size(grant.fields))
    exception('Authorization')
      .msg('grantRequiredToModifyQueue')
      .throw();
};
