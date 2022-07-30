const {
  compact,
  find,
  forEach,
  get,
  invoke,
  isEqual,
  last,
  isNumber,
  isString,
  size,
} = require('lodash');
const Schema = require('./schema');

const asNumber = (num) => (isNumber(num) ? num : 0);

const checkId = (id) => (item) =>
  invoke(item, '_id.equals', id) || isEqual(item._id, id);

const getMaxDate = (a, b) => {
  if (a && !b) return a;
  if (!a && b) return b;
  return new Date(a) > new Date(b) ? a : b;
};

const makeNameWithFileExtension = ({ bucketId, name }) => {
  const parts = isString(bucketId)
    ? bucketId.split('.')
    : [];

  return size(parts) > 1 ? `${name}.${last(parts)}` : name;
};

function ensureFolderStructure() {
  if (!Array.isArray(this.uploads)) this.uploads = [];

  const findById = (id) =>
    find(compact(this.uploads), checkId(id));

  forEach(compact(this.uploads), (upload) => {
    if (upload.folderId && !findById(upload.folderId))
      upload.remove();

    if (!upload.bucketId && upload.name)
      Object.assign(upload, {
        bucketId: upload.name,
      });

    if (
      upload.isDirectModified('name') &&
      upload.name !== upload.bucketId
    )
      Object.assign(upload, {
        name: makeNameWithFileExtension(upload),
      });
  });
}

const generateRelativePaths = (a) =>
  forEach(a, (xs) => {
    const recursivelyBuildRelativePath = (folderId) => {
      if (!folderId) return null;
      const obj = find(a, checkId(folderId));
      if (!obj) return null;
      if (obj.folderId)
        return compact([
          recursivelyBuildRelativePath(obj.folderId),
          obj.name,
        ]).join('/');
      return obj.name;
    };

    Object.assign(xs, {
      relativePath: compact([
        recursivelyBuildRelativePath(xs.folderId),
        xs.name,
      ]).join('/'),
    });
  });

const generateFolderStats = (a = []) => {
  const accumulateStats = ({ _id: id, updatedAt = null }) =>
    a.reduce(
      (acc, curr) => {
        const checkDocId = checkId(id);
        const makeOutput = (incrementer = {}) => ({
          size:
            acc.size +
            asNumber(get(incrementer, 'size', 0)),
          updatedAt: getMaxDate(
            acc.updatedAt,
            incrementer.updatedAt,
          ),
        });

        if (
          checkDocId({ _id: curr.folderId }) &&
          // prevent accidental infinite loops
          !checkDocId(curr)
        ) {
          return curr.folder
            ? makeOutput(accumulateStats(curr))
            : makeOutput(curr);
        }

        return acc;
      },
      {
        updatedAt,
        size: 0,
      },
    );

  forEach(a, (item) => {
    if (!item.folder) return;
    Object.assign(item, accumulateStats(item));
  });

  return a;
};

const executePostMiddleware = (doc) => {
  if (!doc) return;
  generateRelativePaths(doc.uploads);
  generateFolderStats(doc.uploads);
};

Schema.pre('save', ensureFolderStructure);
Schema.post('findById', executePostMiddleware);
Schema.post('findOne', executePostMiddleware);

Schema.post('find', (docs) => {
  forEach(docs, executePostMiddleware);
});

module.exports = {
  makeNameWithFileExtension,
  ensureFolderStructure,
  generateFolderStats,
  generateRelativePaths,
};
