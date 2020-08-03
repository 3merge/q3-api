const { compose, verify } = require('q3-core-composer');
const {
  LoggerModel,
} = require('q3-core-mailer/lib/logger');

const SystemLogsCtrl = async ({ user }, res) => {
  const logs = await LoggerModel.find({
    $or: [
      {
        userId: user._id,
      },
      {
        userId: { $exists: false },
      },
    ],
  })
    .lean()
    .limit(250)
    .exec();

  res.ok({
    logs,
  });
};

SystemLogsCtrl.validation = [verify];

module.exports = compose(SystemLogsCtrl);
