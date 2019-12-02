const getInt = (v) => (i) => Number(v.split(i)[1]);
const checkOp = (v) => (op) =>
  v.startsWith(op) ? v : null;

module.exports = class RatesDecorator {
  meetsThreshold(v) {
    const { threshold } = this;
    const compare = getInt(threshold);
    const fn = checkOp(threshold);

    switch (threshold) {
      case fn('=='):
        return v === compare('==');
      case fn('>'):
        return v > compare('>');
      case fn('<'):
        return v < compare('<');
      case fn('<='):
        return v <= compare('<=');
      case fn('>='):
        return v >= compare('>=');
      default:
        return true;
    }
  }
};
