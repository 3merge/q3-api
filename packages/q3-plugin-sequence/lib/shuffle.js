/* eslint-disable no-param-reassign */
const {
  filter,
  isNil,
  get,
  orderBy,
  last,
  isNumber,
  isObject,
  size,
  forEach,
} = require('lodash');
const { exception } = require('q3-core-responder');

module.exports = function shuffle(data = []) {
  const orderBySeqAndUpdatedAt = (xs) =>
    orderBy(xs, ['seq', 'updatedAt'], ['asc', 'asc']);

  forEach(data, ({ seq }) => {
    if (seq < 1 || seq > size(data))
      exception('Validation')
        .msg('cannotSetOutOfBoundSequence')
        .throw();
  });

  orderBySeqAndUpdatedAt(data).forEach(
    (item, idx, items = []) => {
      const reordered = orderBySeqAndUpdatedAt(items);

      const assignToItem = (seq) => {
        if (isNumber(seq))
          Object.assign(item, {
            seq,
          });
      };

      const curr = item.seq;
      const minus = curr - 1;
      const plus = curr + 1;

      const isEqualTo = (xs) => xs === item.seq;

      const shouldSkip = (xs) =>
        !isObject(xs) ||
        isNil(xs.seq) ||
        String(xs.id) === String(item.id);

      const wasUpdatedEarlier = (xs) =>
        xs.updatedAt > item.updatedAt || !item.updatedAt;

      const prev = reordered.reduce((acc, currItem) => {
        if (shouldSkip(currItem)) return acc;

        if (isEqualTo(currItem.seq)) {
          if (wasUpdatedEarlier(currItem)) return item.seq;

          return minus;
        }

        if (!isEqualTo(acc) && currItem.seq > acc)
          return currItem.seq;

        if (acc < 0)
          return get(
            last(filter(reordered, 'seq')),
            'seq',
            0,
          );

        return acc;
      }, 0);

      const next = prev + 1;

      const hasEmptySpacePrior =
        reordered.findIndex((it) => it.seq === minus) ===
        -1;

      const getNextSeqValue = () => {
        if (isNil(curr)) return idx === 0 ? 1 : next;
        if (curr < 0) return next;

        if (isEqualTo(prev)) {
          if (hasEmptySpacePrior && minus !== 0)
            return minus;

          return plus;
        }

        return undefined;
      };

      assignToItem(getNextSeqValue());
    },
  );

  orderBySeqAndUpdatedAt(data).forEach(
    (item, idx, values) => {
      const closest = values.reduce((acc, curr) => {
        if (curr.seq < item.seq) {
          return curr.seq;
        }

        return acc;
      }, 0);

      if (item.seq - closest > 1) {
        item.seq = closest + 1;
      }
    },
  );

  return data;
};
