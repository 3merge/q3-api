const isTruthy = (val) => val === 'true';

module.exports = {
  exists: (val) =>
    isTruthy(val) ? Boolean(val) : { $ne: true },
  has: (val) =>
    isTruthy(val) ? { $exists: true } : { $exists: false },
};
