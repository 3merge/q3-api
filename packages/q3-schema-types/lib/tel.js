/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');

const removeNonDigits = (v) =>
  String(v).replace(/\W|\D|\s/g, '');

function printTel(parts, ext) {
  if (!parts)
    throw new Error(
      'Value is not a valid North American phone number',
    );

  const [, countryCode, areaCode, officeCode, stationCode] =
    parts;

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

class Tel extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, 'Tel');
  }

  cast(val = '') {
    if (!val.length) return val;
    const [num, , ext] = val.split(/([a-zA-Z]+)/);
    return printTel(validateTel(num), ext);
  }

  castForQuery(val = '') {
    return val;
  }
}

mongoose.Schema.Types.Tel = Tel;
