const mongoose = require('mongoose');

const removeNonDigits = (v) =>
  String(v).replace(/\W|\D|\s/g, '');

function Tel(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

function printTel(parts, ext) {
  if (!parts)
    throw new Error(
      'Value is not a valid North American phone number',
    );

  const [
    ,
    countryCode,
    areaCode,
    officeCode,
    stationCode,
  ] = parts;

  let formatted = '';

  if (countryCode) formatted += `+${countryCode} `;
  if (areaCode) formatted += `(${areaCode}) `;
  if (officeCode) formatted += `${officeCode}-`;
  if (stationCode) formatted += `${stationCode}`;
  if (ext) formatted += ` x${removeNonDigits(ext)}`;
  return formatted;
}

function validateTel(num) {
  return removeNonDigits(`${num}`).match(
    /^([+]?\d{1,2}[.-\s]?)?(\d{3})(\d{3})(\d{4})$/,
  );
}

Tel.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Tel.prototype.cast = function sanitize(val = '') {
  if (!val.length) return val;
  const [num, , ext] = val.split(/([a-zA-Z]+)/);
  return printTel(validateTel(num), ext);
};

Tel.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Tel = Tel;
