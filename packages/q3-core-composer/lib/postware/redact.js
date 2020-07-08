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

      const promises = locations[targetLocation].map(
        async (item) => {
          const original = mutable[item];

          Object.assign(mutable, {
            [item]:
              targetLocation === 'request'
                ? Redact.flattenAndReduceByFields(
                    original,
                    grant,
                  )
                : await Redact(
                    original,
                    user,
                    collectionName,
                  ),
          });
        },
      );

      return Promise.all(promises);
    }),
  );
};
