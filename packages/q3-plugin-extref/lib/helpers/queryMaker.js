const IntepretPaths = require('./interpretPaths');
const { concatenate } = require('../helpers');

const ReferenceReader = (k, value, context) => {
  const ip = IntepretPaths(k, value.length);
  const key = ip.makeOptional();

  const getTargets = (prefix = '') =>
    value.reduce(
      (acc, curr) =>
        Object.assign(acc, {
          [concatenate(prefix, curr)]:
            context[curr === 'ref' ? '_id' : curr],
        }),
      {},
    );

  return (id) => {
    const makeArrayFilter = () => ({
      arrayFilters: [{ [ip.makePosOpFilter()]: id }],
    });

    const makeEmbeddedQuery = () => ({
      [ip.cleanAndAppendReference()]: id,
    });

    const makeSimpleQuery = () => ({
      [ip.getMatchPath()]: id,
    });

    return ip.buildSpecRunner(context)({
      isEmbeddedSetOp: [
        {
          [ip.getReferenceField()]: id,
        },
        {
          $set: getTargets(
            concatenate(ip.makePosOp(), '.'),
          ),
        },
        makeArrayFilter(),
      ],

      isEmbeddedUnsetOpOnRequiredPath: [
        makeEmbeddedQuery(),
        {
          $pull: ip.split(id),
        },
        makeArrayFilter(),
      ],

      isEmbeddedUnsetOp: [
        makeEmbeddedQuery(),
        { $unset: { [ip.makePosOp()]: '' } },
        makeArrayFilter(),
      ],

      isEmbeddedPullOp: [
        {
          [ip.clean()]: {
            $elemMatch: { [ip.getMatchPath()]: id },
          },
        },
        { $pull: { [ip.traverseUp()]: { ref: id } } },
      ],

      isSetOp: [
        makeSimpleQuery(),
        { $set: { [key]: getTargets() } },
      ],

      isPullOp: [
        makeSimpleQuery(),
        { $unset: { [key]: '' } },
      ],
    });
  };
};

ReferenceReader.setup =
  (context) =>
  ([key, value]) =>
    ReferenceReader(key, value, context);

module.exports = ReferenceReader;
