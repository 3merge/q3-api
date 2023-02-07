/* eslint-disable func-names  */
const moment = require('moment');
const session = require('q3-core-session');
const Exporter = require('q3-exports');
const { get, first } = require('lodash');
const Schema = require('./schema');
const aws = require('../../config/aws');
const { toObjectId } = require('../../helpers/utils');
const { getId, getUserPath } = require('../utils');
const { getFileDownload, mapHeaders } = require('./utils');

class NotificationDecorator {
  async __$appendSignedUrl() {
    return getFileDownload(this);
  }

  static async upload(
    {
      name,
      data,
      user,
      buffer,
      options = {},
      excerpt = '',
    },
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
      excerpt,
      path: fileName,
      userId,
    });

    return doc.__$appendSignedUrl();
  }

  static async recent(sessionUser, numberOfDays = 1) {
    const results = await this.find({
      userId: getId(sessionUser),
      createdAt: {
        $gte: moment()
          .subtract(numberOfDays, 'days')
          .toDate(),
      },
    })
      .setOptions({ skipAutocomplete: true })
      .sort('-createdAt')
      .limit(100)
      .exec();

    return Promise.all(
      results.map(async (item) =>
        item.__$appendSignedUrl(),
      ),
    );
  }

  static async saveToSessionNotifications(label, excerpt) {
    return this.create({
      active: true,
      archived: false,
      read: false,
      userId: session.get('USER', '_id'),
      label,
      excerpt,
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

  static async getUnreadIds(messageType) {
    return get(
      first(
        await this.aggregate([
          {
            '$match': {
              'active': true,
              'archived': false,
              'subDocumentId': null,
              'read': false,
              'messageType': messageType,
              'userId': toObjectId(
                session.get('USER', '_id'),
              ),
            },
          },
          {
            '$group': {
              '_id': 0,
              'ids': {
                '$addToSet': '$documentId',
              },
            },
          },
          {
            '$project': {
              '_id': 0,
              'ids': 1,
            },
          },
        ]),
      ),
      'ids',
      [],
    );
  }
}

Schema.loadClass(NotificationDecorator);
