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

  if (status === 'Queued')
    await queue
      .set({
        completedOn: null,
        due: new Date(),
        error: null,
        locked: false,
        status,
      })
      .save();
  else
    exception('Validation')
      .msg('onlyTheStatusMayBeChangedToQueued')
      .throw();

  const out = queue.toObject();
  const avg = await calculateAverageDuration(queue.name);

  out.expectedCompletionDate = avg(queue);
  out.id = queue._id;
  out.status = getResolvedStatus(queue);
  out.type = getType(queue);

  res.ok({
    queue: out,
  });
};

module.exports = compose(QueueLogsPatch);
