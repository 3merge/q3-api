const isTruthy = (val) => val === 'true';
const unwrap = (v) => String(v).replace(/^"(.*)"$/, '$1');

module.exports = {
  exists: (val) =>
    isTruthy(val) ? Boolean(val) : { $ne: true },
  has: (val) =>
    isTruthy(val)
      ? { $exists: true, $ne: '' }
      : { $exists: false },
  in: (val) =>
    String(val)
      .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
      .map(unwrap),
};
