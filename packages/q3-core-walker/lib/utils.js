const appendID = (str) => `:${str.replace(/-/g, '')}ID`;

const appendIDToLast = (p, i, c) =>
  i === c.length - 1 ? p : `${p}/${appendID(p)}`;

exports.getNestedPath = (sub, name = '') => {
  const arr = sub.split('\\').map(appendIDToLast);
  if (name.includes('.id.')) {
    arr.push(appendID(arr[arr.length - 1]));
  }

  return arr.join('/');
};

exports.getVerb = (name) => {
  const [verb] = name.split('.');
  if (
    !['post', 'put', 'patch', 'get', 'delete'].includes(
      verb,
    )
  ) {
    return 'use';
  }

  return verb;
};

exports.sortFiles = (arr = []) =>
  arr
    .filter((item) => !item.name.includes('test'))
    .sort((a, b) => {
      if (
        b.isDirectory() ||
        (a.name.includes('index') &&
          !b.name.includes('index'))
      )
        return -1;
      return 0;
    });
