const STRING = 'SchemaString';
const BOOLEAN = 'SchemaBoolean';
const NUMBER = 'SchemaNumber';
const DATE = 'SchemaDate';
const ARRAY = 'SchemaArray';
const OBJECT_ID = 'ObjectId';

const decypherMessage = (v = []) => {
  const containsWord = (n) =>
    v.some(({ message }) =>
      message.toLowerCase().includes(n),
    );

  if (containsWord('email')) return 'isEmail';
  if (containsWord('phone')) return 'isMobilePhone';
  if (containsWord('url')) return 'isURL';
  return 'isString';
};

module.exports = (v) => {
  let output;
  const { options = {} } = v;

  console.log(v.constructor.name);

  switch (v.constructor.name) {
    case STRING:
      output = {
        required: options.required,
        minLength: options.minlength,
        maxLength: options.maxlength,
        enum: options.enum,
        unique: options.unique,
        validator: decypherMessage(v.validators),
      };
      break;
    case BOOLEAN:
      output = {
        required: options.required,
        validator: 'isBoolean',
      };
      break;
    case NUMBER:
      output = {
        required: options.required,
        min: options.min,
        max: options.max,
        validator: 'isFloat',
      };
      break;
    case DATE:
      output = {
        min: options.min,
        max: options.max,
        required: options.required,
        validator: 'isISO8601',
      };
      break;
    case OBJECT_ID:
      output = {
        required: options.required,
        validator: 'isMongoId',
      };
      break;
    case ARRAY:
      output = {
        validator: 'isArray',
        required: options.required,
      };
      break;
    default:
      output = null;
      break;
  }

  return output
    ? Object.entries(output).reduce((a, [k, val]) => {
        const copy = { ...a };
        if (val !== null) copy[k] = val;
        return copy;
      }, {})
    : null;
};
