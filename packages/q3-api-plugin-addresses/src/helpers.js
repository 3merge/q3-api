export const validateNorthAmericanPhoneNumber = (v = '') =>
  new RegExp(
    /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  ).test(v);

export const validateNorthAmericanPostalCode = (v = '') =>
  new RegExp(
    /^[0-9]{5}$|^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/,
  ).test(v.toUpperCase().replace(/\s+/g, ''));

export const validateWebsite = (v = '') =>
  new RegExp(
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
  ).test(v);
