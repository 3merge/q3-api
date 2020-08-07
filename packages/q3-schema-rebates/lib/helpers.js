const compact = (a) => a.filter((v) => v && v !== '');

const notNumber = (a) =>
  Number.isNaN(Number(a)) ||
  a === null ||
  a === undefined ||
  a === '';

exports.getRemainder = (a, b, c) => {
  let num1 = a;
  let num2 = b;

  if (notNumber(a)) num1 = Infinity;
  if (notNumber(b)) num2 = Infinity;
  if (notNumber(c)) return 0;

  if (num1 <= num2 && num1 < c) return a;
  if (num1 > num2 && num2 < c) return b;
  return c;
};

exports.sofar = (a) =>
  a.reduce((all, curr) => all + curr, 0);

exports.hasLength = (a) =>
  Array.isArray(a) && compact(a).length;

exports.compact = compact;
