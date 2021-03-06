const converter = require('json-2-csv');

module.exports = (body) =>
  new Promise((resolve, reject) =>
    converter.json2csv(body, (err, csv) => {
      if (err) reject(err);
      else
        resolve(
          Buffer.from(
            csv
              .replace(/,null,/g, ',,')
              .replace(/,undefined,/g, ',,'),
            'utf8',
          ),
        );
    }),
  );
