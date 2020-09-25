const makeInterface = (methodNames) =>
  class InterfaceBuilder {
    constructor() {
      methodNames.forEach((item) => {
        if (typeof this[item] !== 'function')
          throw new Error(
            `Interface requires ${item} to be a function`,
          );
      });
    }
  };

exports.DatasourceAdapterInterface = makeInterface([
  'define',
  'from',
  'end',
  'start',
]);

exports.DatasourceAdapterInterface = makeInterface([
  'create',
  'createMany',
  'find',
  'findAll',
  'findMany',
  'remove',
  'removeMany',
  'update',
  'updateMany',
]);

exports.DatasourceModelAdapterInterface = makeInterface([
  'addAfterFindHook',
  'addAfterSaveHook',
  'addBeforeFindHook',
  'addBeforeSaveHook',
  'addPathGetter',
  'addVirtualGetter',
  'addPathSetter',
  'addVirtualSetter',
  'build',
  'out',
]);

exports.DatasourceInstanceAdapterInterface = makeInterface([
  'dispatch',
  'getPrevious',
  'isNew',
  'hasChanged',
  'set',
  'submit',
]);

exports.FileAdapterInterface = makeInterface([
  'add',
  'copy',
  'get',
  'remove',
  'transfer',
]);
