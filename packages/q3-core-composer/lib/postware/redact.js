const { Redact } = require('q3-core-access');

module.exports = async (
  { user, redactions },
  mutable,
  targetLocation,
) => {
  if (
    typeof redactions !== 'object' ||
    Object.keys(redactions).length === 0
  )
    return;

  await Promise.all(
    Object.values(redactions).map(async (redaction) => {
      const {
        collectionName,
        locations,
        grant,
      } = redaction;

      const execRedactFn = async (data) => {
        const hasPrefix = locations && locations.prefix;

        // shape the payload
        const input = hasPrefix
          ? { [locations.prefix]: data }
          : data;

        const output =
          targetLocation === 'request'
            ? await Redact.flattenAndReduceByFields(
                input,
                grant,
              )
            : await Redact(input, user, collectionName);

        // re-shape the payload
        return hasPrefix
          ? output[locations.prefix]
          : output;
      };

      const promises = locations[targetLocation].map(
        async (item) => {
          const original = mutable[item];

          Object.assign(mutable, {
            [item]: await execRedactFn(original),
          });
        },
      );

      return Promise.all(promises);
    }),
  );
};
