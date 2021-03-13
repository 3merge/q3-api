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
      .match(/(".*?"|[^",]+)/g)
      .map(unwrap),
  string: (v) => {
    const str = String(v);
    const parts = str.match(/^\/(.*)\/([igm]*)$/);

    return !String(v).startsWith('/') || !parts
      ? str.replace(/^"(.*)"$/, '$1')
      : {
          $regex: parts[1],
          $options: parts[2] || 'i',
        };
  },
};
