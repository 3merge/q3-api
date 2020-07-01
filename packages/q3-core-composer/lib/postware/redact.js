const { flatten, unflatten } = require('flat');
const micromatch = require('micromatch');
const { get } = require('lodash');

const ifArray = (input, next) =>
  !Array.isArray(input) ? next(input) : input.map(next);

class Redact {
  constructor(id, target = {}) {
    if (!id || !['response', 'request'].includes(id))
      throw new Error(
        'ID must equal "request" or "response"',
      );

    this.id = id;
    this.mutable = target;
  }

  $append(doc) {
    return ifArray(doc, (v) =>
      this.prefix
        ? {
            [this.prefix]: v,
          }
        : v,
    );
  }

  $detach(doc) {
    return ifArray(doc, (v) =>
      this.prefix ? v[this.prefix] : v,
    );
  }

  $filter(doc = {}) {
    const flat = flatten(doc);

    const match = micromatch(
      Object.keys(flat),
      this.fields,
    );

    const unwind = match.reduce(
      (acc, key) =>
        Object.assign(acc, {
          [key]: flat[key],
        }),
      {},
    );

    return unflatten(unwind);
  }

  $runTransformers(acc, v) {
    const input = this.$append(this.mutable[v]);
    const output = ifArray(input, this.$filter.bind(this));
    const transformed = this.$detach(output);

    return Object.assign(acc, {
      [v]: transformed,
    });
  }

  $getEntries() {
    return this.rules.reduce(
      this.$runTransformers.bind(this),
      {},
    );
  }

  exec({ fields = [], readOnly = [], locations = {} }) {
    const { prefix } = locations;
    this.rules = get(locations, this.id, []);
    this.prefix = prefix;

    // for response payloads,
    // only reference the readOnly field rules
    this.fields =
      this.id === 'response' ? readOnly : fields;

    return this.$getEntries();
  }
}

const redactPostware = (
  { redactions },
  mutable,
  targetLocation,
) => {
  const redact = new Redact(targetLocation, mutable);

  return typeof redactions === 'object' &&
    Object.keys(redactions).length
    ? Object.assign(
        mutable,
        Object.values(redactions)
          .map(redact.exec.bind(redact))
          .reduce(
            (prev, next) => Object.assign(prev, next),
            {},
          ),
      )
    : mutable;
};

module.exports = redactPostware;
redactPostware.Redact = Redact;
