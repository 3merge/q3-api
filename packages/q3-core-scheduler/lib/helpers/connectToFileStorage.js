const aws = require('q3-api/lib/config/aws');
const { get, last, size } = require('lodash');
const { executeOnAsync } = require('q3-schema-utils');
const { Readable } = require('stream');

const bufferToStream = (buffer) =>
  Readable.from(Buffer.from(buffer, 'utf-8'));

const getFileStreamsFromAws = async (buckets = []) => {
  const buffers = await executeOnAsync(
    buckets,
    aws().getBuffer,
  );

  return buckets.reduce((acc, curr, i) => {
    acc[last(curr.split('/'))] = bufferToStream(buffers[i]);
    return acc;
  }, {});
};

module.exports = async (data) => {
  const buckets = get(data, 'data.buckets', []);

  return {
    ...data,
    attachments:
      size(buckets) > 0
        ? await getFileStreamsFromAws(buckets)
        : {},
  };
};
