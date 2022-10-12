const {
  isFunction,
  get,
  compact,
  map,
  uniq,
  flatten,
  isNil,
} = require('lodash');
const formatter = require('./formatter');
const unwind = require('./unwind');

module.exports = (
  data,
  columns,
  { customCache, customFormatters, onAddToCsv, onData },
) => {
  const pickList = uniq(
    compact(
      flatten([
        ...map(columns, 'field'),
        ...map(columns, 'targets'),
      ]),
    ),
  );

  const finalOutput = data.reduce((acc, json) => {
    const extendedJson = isFunction(onData)
      ? onData(json, customCache)
      : json;

    unwind(extendedJson, pickList).forEach((f) => {
      const output = { ...f };

      columns.forEach((col) => {
        const value = output[col.field];
        let v = formatter(value, col.formatter);

        try {
          if (isFunction(col.code))
            v = col.code(value, output);
          else if (customFormatters[col.formatter])
            v = customFormatters[col.formatter](
              value,
              output,
            );
          else if (col.formatter === 'concat') {
            v = compact(
              col.targets.map((t) => get(output, t)),
            ).join(' ');
          }
        } catch (e) {
          // noop
        }

        if (isNil(v)) {
          v = '';
        }

        output[col.field] = v;
      });

      if (!isFunction(onAddToCsv) || onAddToCsv(output))
        acc.push(JSON.stringify(output));
    });

    return acc;
  }, []);

  // if we don't compare as strings
  // then we hit some pretty major performance issues
  return [...new Set(finalOutput)].map(JSON.parse);
};
