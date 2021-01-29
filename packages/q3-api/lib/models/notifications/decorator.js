/* eslint-disable func-names  */
const moment = require('moment');
const session = require('q3-core-session');
const Exporter = require('q3-exports');
const { pick } = require('lodash');
const Schema = require('./schema');
const aws = require('../../config/aws');
const { getId, getUserPath } = require('../utils');

function mapHeaders(docs, legend) {
  return docs.map((doc) => {
    const picked = pick(doc, Object.keys(legend));
    return Object.entries(legend).reduce(
      (acc, [key, value]) => {
        acc[value] = picked[key];
        return acc;
      },
      {},
    );
  });
}

class NotificationDecorator {
  static async acknowledge(id) {
    const d = await this.findById(id).exec();

    if (d) {
      if (d.path) {
        d.hasDownloaded = true;
      } else {
        d.hasSeen = true;
      }

      await d.save();
    }
  }

  async __$appendSignedUrl() {
    const j = 'toJSON' in this ? this.toJSON() : this;

    return {
      url: j.path ? await aws().getPrivate(j.path) : null,
      ...j,
    };
  }

  static async upload(
    { name, data, user, buffer, options = {} },
    columnMapDef,
  ) {
    const [, ext] = name.split('.');
    const userId = getId(user);
    const fileName = getUserPath(user, name);

    if ((!data || !data.length) && !buffer) return null;

    if (!buffer)
      // eslint-disable-next-line
      buffer = await new Exporter(ext, options).toBuffer(
        columnMapDef
          ? mapHeaders(data, columnMapDef)
          : data,
      );

    await aws().add(fileName, buffer);
    const doc = await this.create({
      path: fileName,
      userId,
    });

    return doc.__$appendSignedUrl();
  }

  static async recent(sessionUser) {
    const results = await this.find({
      userId: getId(sessionUser),
      createdAt: {
        $gte: moment().subtract(1, 'days').toDate(),
      },
    })
      .sort('-createdAt')
      .limit(10)
      .exec();

    return Promise.all(
      results.map(async (item) =>
        item.__$appendSignedUrl(),
      ),
    );
  }

  static async saveToSessionNotifications(label) {
    return this.create({
      hasSeen: false,
      userId: session.get('USER', '_id'),
      label,
    });
  }

  static async saveToSessionDownloads(
    name,
    args,
    columnMapDef,
  ) {
    return this.upload(
      {
        ...args,
        user: session.get('USER'),
        name,
      },
      columnMapDef,
    );
  }
}

Schema.loadClass(NotificationDecorator);
