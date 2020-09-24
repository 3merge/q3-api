const join = (...args) => args.filter(Boolean).join('/');
const isObject = (v) => typeof v === 'object' && v !== null;

exports.getFirstProperty = (obj = {}) =>
  isObject(obj) ? obj[Object.keys(obj)[0]] : null;

exports.reduceByFileName = (files) =>
  isObject(files)
    ? Object.entries(files).reduce((acc, [next, file]) => {
        acc[file.name] = next;
        return acc;
      }, {})
    : {};

exports.mapAsFileObject = (files, prefix, options = {}) =>
  isObject(files)
    ? Object.values(files).map((file) => ({
        filename: join(prefix, file.name),
        data: file,
        ...options,
      }))
    : [];

exports.startsWith = (a, b) =>
  typeof a === 'string' ? a.startsWith(b) : false;
