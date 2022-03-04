const Comparison = require('comparisons');
const {
  isObject,
  get,
  compact,
  size,
  map,
  uniq,
  set,
  pick,
  merge,
} = require('lodash');
const {
  makeArray,
  makeSessionPayload,
} = require('../helpers');

module.exports = function Field(
  fields = [],
  target = {},
  options = {},
) {
  const { includeConditionalGlobs = false, user = {} } =
    options;

  const decorateGlob = (xs) => {
    let output = xs.glob;
    if (xs.wildcard) output = `*${output}*`;
    if (xs.negate) output = `!${output}`;
    return output;
  };

  const cleanFields = (xs) =>
    compact(
      map(xs, (item) => {
        if (!item) return null;
        if (!isObject(item)) return item;

        let { glob } = item;
        const { glob: originalGlob } = item;
        const test = makeArray(item.test);

        const mutateGlob = (idx) => {
          // eslint-disable-next-line
          item.glob = String(glob).replace(
            '.*.',
            `.${idx}.`,
          );

          if (item.glob.endsWith('.'))
            // eslint-disable-next-line
            item.glob = item.glob.substring(
              0,
              item.glob.length - 1,
            );
        };

        const execTest = (evaluationTarget) => {
          const output =
            !size(test) ||
            new Comparison(test).eval(
              merge(
                {},
                makeSessionPayload(),
                {
                  q3: {
                    session: {
                      // allows us to plug-in different users
                      // to the same underlying session
                      user: pick(user, [
                        '_id',
                        'role',
                        'email',
                        'name',
                        'active',
                      ]),
                    },
                  },
                },
                evaluationTarget,
              ),
            )
              ? decorateGlob(item)
              : null;

          // eslint-disable-next-line
          item.glob = originalGlob;
          return output;
        };

        const paths = item.unwind
          ? String(item.unwind).split('.')
          : [];

        const execTestForEachPath = (
          parentTarget,
          pathIndex,
        ) => {
          const currentTarget = { ...parentTarget };
          const workingIndex = pathIndex + 1;
          const path = paths.slice(0, workingIndex);

          // reset it with top level
          glob = item.glob;

          return map(
            get(currentTarget, path),

            (level, i) => {
              mutateGlob(i);
              set(currentTarget, path, level);

              return paths.length === workingIndex
                ? execTest(currentTarget)
                : execTestForEachPath(
                    currentTarget,
                    workingIndex,
                  );
            },
          );
        };

        return size(paths)
          ? execTestForEachPath(target, 0)
          : execTest(target);
      }).flat(5),
    ).sort((a, b) => {
      if (b.startsWith('!')) return -1;
      return 0;
    });

  return cleanFields(
    uniq(fields).map((item) => {
      if (!includeConditionalGlobs && isObject(item)) {
        return decorateGlob(item);
      }

      return item;
    }),
  );
};
