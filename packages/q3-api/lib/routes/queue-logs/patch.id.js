const { compose } = require('q3-core-composer');
const Scheduler = require('q3-core-scheduler');
const { exception } = require('q3-core-responder');
const {
  calculateAverageDuration,
  checkOp,
  getResolvedStatus,
  getType,
} = require('./utils');

const QueueLogsPatch = async (
  { body: { status }, params: { queuelogsID }, user },
  res,
) => {
  const queue = await Scheduler.__$db.findById(queuelogsID);

  checkOp(queue, user, 'Update');
  const type = getType(queue);

  if (status !== 'Queued')
    exception('Validation')
      .msg('onlyTheStatusMayBeChangedToQueued')
      .throw();

  if (
    type === 'Recurring' &&
    (await Scheduler.__$db.count({
      name: queue.name,
      status: 'Queued',
    }))
  )
    exception('Conflict')
      .msg('cannotRescheduleRecurringTask')
      .throw();

  await queue
    .set({
      completedOn: null,
      due: new Date(),
      error: null,
      locked: false,
      status,
    })
    .save();

  const out = queue.toObject();
  const avg = await calculateAverageDuration(queue.name);

  out.expectedCompletionDate = avg(queue);
  out.id = queue._id;
  out.status = getResolvedStatus(queue);
  out.type = type;

  res.ok({
    queue: out,
  });
};

module.exports = compose(QueueLogsPatch);
