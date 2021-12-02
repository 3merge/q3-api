const { compose } = require('q3-core-composer');
const Scheduler = require('q3-core-scheduler');
const { map, first } = require('lodash');
const {
  calculateAverageDuration,
  checkOp,
  getDuration,
  getImportedFile,
  getResolvedStatus,
  getType,
} = require('./utils');

const QueueLogsGet = async (req, res) => {
  checkOp({}, req.user, 'Read');

  const avg = await calculateAverageDuration();
  const queues = await Scheduler.__$db
    .find({})
    .sort({ due: -1 })
    .limit(250)
    .lean()
    .exec();

  res.ok({
    queues: map(queues, (q) => ({
      ...q,
      completionDate: q.completedOn || q.due,
      duration: getDuration(q),
      expectedCompletionDate: avg(q),
      id: q._id,
      imports: getImportedFile(q),
      message: q.error,
      name: first(String(q.name).split('@')),
      status: getResolvedStatus(q),
      type: getType(q),
    })),
  });
};

module.exports = compose(QueueLogsGet);
