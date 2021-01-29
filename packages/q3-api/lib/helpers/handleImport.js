const { size } = require('lodash');
const csv = require('fast-csv');

module.exports = (next, headers) => async (
  payload,
  attachments,
) => {
  const rows = [];
  return new Promise((resolve, reject) =>
    csv
      .parseStream(attachments.import, {
        renameHeaders: size(headers) > 0,
        headers,
      })
      .on('error', reject)
      .on('data', rows.push.bind(rows))
      .on('end', () => resolve(rows)),
  ).then(next);
};
