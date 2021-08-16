const { size, isObject } = require('lodash');
const csv = require('fast-csv');

module.exports =
  (next, headers) => async (payload, attachments) =>
    new Promise((resolve, reject) => {
      const rows = [];

      if (!isObject(attachments))
        return reject(new Error('No attachments'));

      return csv
        .parseStream(
          attachments[Object.keys(attachments)[0]],
          {
            renameHeaders: size(headers) > 0,
            headers,
          },
        )
        .on('error', reject)
        .on('data', rows.push.bind(rows))
        .on('end', () => resolve(rows));
    }).then(next);
