const Comparison = require('comparisons');
const {
  isObject,
  isFunction,
  get,
  compact,
  size,
  map,
  uniq,
  set,
  pick,
  invoke,
  merge,
} = require('lodash');
const { makeArray } = require('../helpers');

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

  const makeQ3Payload = () => {
    const pathToDynamicPaths = [
      user,
      'constructor.getFieldSessionPaths',
    ];

    return {
      q3: {
        session: {
          user: isFunction(get(...pathToDynamicPaths))
            ? invoke(...pathToDynamicPaths)
            : pick(user, [
                '_id',
                'role',
                'email',
                'name',
                'active',
              ]),
        },
      },
    };
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
        };

        const execTest = (evaluationTarget) => {
          const output =
            !size(test) ||
            new Comparison(test).eval(
              merge(makeQ3Payload(), evaluationTarget),
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
      if (includeConditionalGlobs && isObject(item)) {
        return decorateGlob(item);
      }

      return item;
    }),
  );
};
