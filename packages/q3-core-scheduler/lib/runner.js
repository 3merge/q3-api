const path = require('path');
const { readdirSync } = require('fs');
const aws = require('q3-api/lib/config/aws');
const session = require('q3-core-session');
const { get, last } = require('lodash');
const { executeOnAsync } = require('q3-schema-utils');
const { Readable } = require('stream');
const { isRecurringJob, parse } = require('./utils');

const bufferToStream = (buffer) =>
  Readable.from(Buffer.from(buffer).toString());

module.exports = (directory) => {
  const root = path.resolve(directory, './chores');

  return {
    execute: async ({ name, payload = {} }) => {
      // eslint-disable-next-line
      const fn = require(path.join(root, name));
      const data = parse(payload);

      const buckets = get(data, 'buckets', []);
      const buffers = await executeOnAsync(
        buckets,
        aws().getBuffer,
      );

      return session.hydrate(
        { __$q3: get(data, 'session') },
        () =>
          fn(
            data,
            buckets.reduce((acc, curr, i) => {
              acc[last(curr.split('/'))] = bufferToStream(
                buffers[i],
              );
              return acc;
            }, {}),
          ),
      );
    },

    walk: () =>
      readdirSync(root).reduce(
        (acc, dirent) =>
          isRecurringJob(dirent) ? acc.concat(dirent) : acc,
        [],
      ),
  };
};
