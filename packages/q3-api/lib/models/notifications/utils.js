const { pick } = require('lodash');
const aws = require('../../config/aws');

exports.getFileDownload = async (doc) => {
  const output = 'toJSON' in doc ? doc.toJSON() : doc;

  return {
    url:
      output && output.path
        ? await aws().getPrivate(output.path)
        : null,
    ...output,
  };
};

exports.convertMiddlewareParameterIntoArray = (doc) =>
  [doc].flat().filter(Boolean);

exports.mapHeaders = (docs, legend) =>
  docs.map((doc) => {
    const picked = pick(doc, Object.keys(legend));
    return Object.entries(legend).reduce(
      (acc, [key, value]) => {
        acc[value] = picked[key];
        return acc;
      },
      {},
    );
  });
