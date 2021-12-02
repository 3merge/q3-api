const { compose } = require('q3-core-composer');
const Scheduler = require('q3-core-scheduler');
const { exception } = require('q3-core-responder');
const { checkOp } = require('./utils');

const QueueLogsDelete = async (
  { params: { queuelogsID }, user },
  res,
) => {
  const queue = await Scheduler.__$db.findById(queuelogsID);
  checkOp(queue, user, 'Delete');

  if (queue.status === 'Done')
    exception('Conflict')
      .msg('cannotDeleteDoneTask')
      .throw();

  if (!queue.name.includes('@'))
    await Scheduler.__$db.findByIdAndDelete(queuelogsID);
  else
    exception('Conflict')
      .msg('cannotDeleteRecurringTask')
      .throw();

  res.acknowledge();
};

module.exports = compose(QueueLogsDelete);
