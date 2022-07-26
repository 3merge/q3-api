const {
  compact,
  find,
  forEach,
  get,
  invoke,
  isEqual,
  isNumber,
  isString,
  last,
  reduce,
} = require('lodash');
const mongoose = require('mongoose');
const Schema = require('./schema');

const asNumber = (num) => (isNumber(num) ? num : 0);

const checkId = (id) => (item) =>
  invoke(item, '_id.equals', id) || isEqual(item._id, id);

const getMaxDate = (a, b) => {
  if (a && !b) return a;
  if (!a && b) return b;
  return new Date(a) > new Date(b) ? a : b;
};

const splitRelativePathIntoFolderArray = (str) =>
  String(str).split('/').slice(0, -1);

const convertLegacyRelativePathsToFolderObjects = (a) =>
  reduce(
    a,
    (acc, curr) => {
      /**
       * @NOTE
       * This would indicate either:
       * (a) it's not a legacy file
       * (b) it was previously removed incorrectly
       */
      if (!curr || !isString(get(curr, 'relativePath')))
        return acc;

      const trace = [];

      splitRelativePathIntoFolderArray(
        curr.relativePath,
      ).forEach((name) => {
        const findFolder = (folderId = null) =>
          [...acc, ...a].find(
            (item) =>
              item.folder &&
              item.folderId === folderId &&
              item.name === name,
          );

        const makeFolder = (folderId = null) => {
          const newObj = {
            _id: mongoose.Types.ObjectId(),
            folder: true,
            folderId,
            name,
          };

          acc.push(newObj);
          return newObj;
        };

        const makeFolderAndPushToTrace = (
          folderId = null,
        ) => {
          const f = findFolder(folderId);
          if (f) trace.push(f);
          else trace.push(makeFolder(folderId));
        };

        makeFolderAndPushToTrace(
          get(last(trace), '_id', null),
        );
      });

      return acc;
    },
    [],
  );

function ensureFolderStructure() {
  /**
   * @NOTE
   * If schema didn't previously use this plugin and had the uploads key set to nullish.
   */
  if (!Array.isArray(this.uploads)) this.uploads = [];

  convertLegacyRelativePathsToFolderObjects(
    this.uploads,
  ).forEach((folder) => {
    this.uploads.push(folder);
  });

  const findById = (id) => find(this.uploads, checkId(id));

  const findByNameAndFolderId = (name, folderId = null) =>
    find(
      this.uploads,
      (u) =>
        u.name === name &&
        u.folder &&
        u.folderId === folderId,
    );

  forEach(this.uploads, (upload) => {
    if (upload.folderId && !findById(upload.folderId))
      Object.assign(upload, {
        folderId: null,
      });

    if (!upload.bucketId && upload.name)
      Object.assign(upload, {
        bucketId: upload.name,
      });

    if (
      isString(upload.relativePath) &&
      upload.relativePath.includes('/') &&
      !upload.folderId
    ) {
      Object.assign(upload, {
        folderId: splitRelativePathIntoFolderArray(
          upload.relativePath,
        ).reduce(
          (acc, curr) =>
            get(
              findByNameAndFolderId(curr, acc),
              '_id',
              acc,
            ),
          null,
        ),
      });

      // eslint-disable-next-line
      delete upload.relativePath;
    }
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
  convertLegacyRelativePathsToFolderObjects,
  ensureFolderStructure,
  generateFolderStats,
  generateRelativePaths,
};
