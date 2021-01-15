const csv = require('fast-csv');

module.exports = async (e, attachments) => {
  console.log(attachments);

  // return new Promise((resolve, reject) =>
  //   csv
  //     .parseStream(attachments.test)
  //     .on('error', reject)
  //     .on('data', rows.push.bind(rows))
  //     .on('end', () => resolve(rows)),
  // ).then((resp) => {
  //   console.log(resp);
  // });
};
