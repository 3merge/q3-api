const { get } = require('lodash');
const path = require('path');
const { Schema } = require('mongoose');
const moment = require('moment');
const Exporter = require('q3-exports');
const aws = require('../../config/aws');

const getId = (user) => get(user, '_id', 'sys');

const getUserPath = (user, fileName) =>
  path
    .join('reports', getId(user), fileName)
    .replace(/\\/g, '/');

const ReportsSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    path: String,
  },
  {
    timestamps: true,
  },
);

ReportsSchema.statics.upload = async function saveToAws(
  name,
  data,
  sessionUser,
) {
  const [, ext] = name.split('.');
  const fileName = getUserPath(sessionUser, name);

  await new Exporter(ext).toBuffer(data).then((buffer) => {
    return aws().add(fileName, buffer);
  });

  return this.create({
    path: fileName,
  });
};

ReportsSchema.statics.recent = async function getFromAws(
  sessionUser,
) {
  const results = await this.find({
    path: new RegExp(getId(sessionUser)),
    createdAt: {
      $gte: moment().subtract(1, 'days').toDate(),
    },
  })
    .lean()
    .exec();

  return Promise.all(
    results.map((item) => {
      return aws().getPrivate(item.path);
    }),
  );
};

ReportsSchema.statics.uploadAndReturnRecent = async function (
  name,
  data,
  sessionUser,
) {
  await this.upload(name, data, sessionUser);
  return this.recent(sessionUser);
};

module.exports = ReportsSchema;
