exports.findArgument = (arg, defaultValue = null) =>
  process.argv.reduce((acc, curr, idx, array) => {
    if (curr === `--${arg}`) return array[idx + 1];
    return acc;
  }, undefined) || defaultValue;
