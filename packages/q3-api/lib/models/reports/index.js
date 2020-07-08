const { get, pick } = require('lodash');
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
    hasDownloaded: Boolean,
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

  if (!data || !data.length) return null;

  const buffer = await new Exporter(ext).toBuffer(data);
  await aws().add(fileName, buffer);

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
    results.map(async (item) => {
      return {
        url: await aws().getPrivate(item.path),
        ...item,
      };
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

ReportsSchema.statics.mapHeaders = function (
  docs,
  legend,
  trans,
) {
  const translate = (key) =>
    typeof trans === 'function' ? trans(key) : key;

  return docs.map((doc) => {
    const picked = pick(doc, Object.keys(legend));
    return Object.entries(legend).reduce(
      (acc, [key, value]) => {
        acc[translate(value)] = picked[key];
        return acc;
      },
      {},
    );
  });
};

module.exports = ReportsSchema;
