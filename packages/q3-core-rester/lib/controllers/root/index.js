const {
  redact,
  check,
  query,
} = require('q3-core-composer');
const RestRegistration = require('../../datasource');
const Remove = require('./delete');
const RemoveMany = require('./deleteMany');
const Get = require('./get');
const List = require('./list');
const Patch = require('./patch');
const Post = require('./post');
const Upload = require('./upload');

module.exports = class DocumentControllerCommander extends RestRegistration {
  exec() {
    const rootPath = this.getPathName();
    const resourcePath = this.getResourcePathName();

    this.getListController(rootPath);
    this.getPostController(rootPath);
    this.getDeleteManyController(rootPath);

    this.getGetController(resourcePath);
    this.getPatchController(resourcePath);
    this.getDeleteController(resourcePath);
    this.getUploadController(resourcePath);

    return this.app;
  }

  getListController(path) {
    List.authorization = [
      redact(this.collectionName)
        .inRequest('query')
        .inResponse(this.collectionPluralName),
    ];

    List.validation = [
      check('search')
        .isString()
        .respondsWith('isString')
        .optional(),
      check('limit')
        .isInt()
        .respondsWith('isInt')
        .optional(),
      check('select')
        .isString()
        .respondsWith('isString')
        .optional(),
    ];

    return this.makeGet(path, List);
  }

  getGetController(path) {
    Get.authorization = [
      redact(this.collectionName)
        .inRequest('query')
        .inResponse(this.collectionSingularName),
    ];

    return this.makeGet(path, Get);
  }

  getPostController(path) {
    Post.authorization = [
      redact(this.collectionName)
        .inRequest('body')
        .inResponse(this.collectionSingularName),
    ];

    Post.validation = this.getValidationSchema(true);
    return this.makePost(path, Post);
  }

  getUploadController(path) {
    Upload.authorization = [
      redact(this.collectionName).requireField(
        'featuredUpload',
      ),
    ];

    return this.makePost(path, Upload);
  }

  getPatchController(path) {
    Patch.authorization = [
      redact(this.collectionName)
        .inRequest('body')
        .inResponse(this.collectionSingularName),
    ];

    Patch.validation = this.getValidationSchema(false);
    return this.makePost(path, Post);
  }

  getDeleteController(path) {
    Remove.authorization = [redact(this.collectionName)];
    return this.makeDelete(path, Remove);
  }

  getDeleteManyController(path) {
    RemoveMany.validation = [query('ids').isArray()];
    RemoveMany.authorization = [
      redact(this.collectionName),
    ];

    return this.makeDelete(path, RemoveMany);
  }
};
