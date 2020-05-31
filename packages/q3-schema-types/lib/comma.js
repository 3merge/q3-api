const mongoose = require('mongoose');
const isGlob = require('is-glob');

const clean = (a = []) =>
  a.map((v) => v.trim().toLowerCase()).filter(Boolean);

const throwOnDuplicate = (a = []) => {
  const simple = a.filter((v) => !isGlob(v));
  const dups = simple.filter(
    (item, index) => simple.indexOf(item) !== index,
  );

  if (dups.length)
    throw new Error(
      `CommaDelimited: Values "${dups.join(
        ', ',
      )}" duplicated`,
    );
};

function CommaDelimited(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

CommaDelimited.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

CommaDelimited.prototype.cast = function castToString(
  val,
  e,
) {
  let output = [];

  if (e.constructor.name === 'Query') return val;

  if (Array.isArray(val)) {
    output = clean(val);
  } else if (typeof val === 'string') {
    output = clean(val.split(','));
  }

  throwOnDuplicate(output);
  return output;
};

mongoose.Schema.Types.CommaDelimited = CommaDelimited;
