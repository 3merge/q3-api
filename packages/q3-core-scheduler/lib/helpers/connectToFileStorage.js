const { adapter } = require('q3-core-files');
const { get, last, size } = require('lodash');
const { executeOnAsync } = require('q3-schema-utils');
const { Readable } = require('stream');

const bufferToStream = (buffer) =>
  Readable.from(Buffer.from(buffer).toString());

const getFileStreamsFromAws = async (buckets = []) => {
  const buffers = await executeOnAsync(
    buckets,
    adapter.getBuffer,
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
