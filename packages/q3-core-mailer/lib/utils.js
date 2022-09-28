const { isString, size, invoke } = require('lodash');
const path = require('path');

const isValidEmailAddress = (v) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(v).toLowerCase(),
  );

const langCode = (v) =>
  typeof v === 'string'
    ? v.toLowerCase().split('-')[0]
    : 'en';

const isFn = (v) => typeof v === 'function';

const runAsFn = (v, args) => (isFn(v) ? v(args) : v);

exports.filterByEmailValidity = (a = []) =>
  a
    .map((v) => v.trim())
    .filter(isValidEmailAddress)
    .join(', ');

exports.prefix = (args) =>
  Object.entries(args).reduce(
    (acc, [key, value]) =>
      Object.assign(acc, { [`v:${key}`]: value }),
    {},
  );

exports.getTemplate = (lang, eventName, templateName) =>
  `${langCode(lang)}-${templateName || eventName}`;

exports.appendFilterFnToUserModel = (promise, filterFn) =>
  promise
    .select('role email firstName lastName lang __t')
    .lean()
    .then((res) =>
      isFn(filterFn) ? res.filter(filterFn) : res,
    );

exports.reduceListenersByLang = (users = [], getUrl) =>
  users.reduce((acc, user) => {
    const l = langCode(user.lang);
    if (!acc[l]) acc[l] = [];

    acc[l].push({
      url: runAsFn(getUrl, user.role),
      to: user.email,
      ...user,
    });

    return acc;
  }, {});

exports.langCode = langCode;

exports.convertFromCamelCase = (initialStr) => {
  const str = String(initialStr);
  const parts = str.match(/[A-Z][a-z]+/g);

  return (
    size(parts) ? parts.join('-') : str
  ).toLowerCase();
};

exports.getWebAppUrlAsTenantUser = (user = {}) => {
  const { tenant } = user;
  const customUrl = invoke(global, 'getWebApp', tenant);
  const url = process.env.WEB_APP;

  if (customUrl) return customUrl;

  if (tenant && isString(url)) {
    const [protocol, host] = url.split('//');
    return `${protocol}//${tenant}.${host}`;
  }

  return url;
};

exports.cleanCallerResponse = (str) =>
  isString(str) ? path.basename(str).split('.')[0] : str;

exports.getEmailCollectionNameFromEnv = () =>
  process.env.EMAIL_COLLECTION || 'emails';
