const {
  redact,
  check,
  query,
} = require('q3-core-composer');
const RestRegistration = require('../../datasource');
const {
  List,
  Put,
  Post,
  Patch,
  Remove,
  RemoveMany,
} = require('./handlers');

module.exports = class SubDocumentControllerCommander extends RestRegistration {
  exec() {
    const rootPath = this.getNestedPathName();
    const resourcePath = this.getNestedResourcePathName();
    this.addDocumentLookupMiddleware();

    this.getListController(rootPath);
    this.getDeleteManyController(rootPath);
    this.getPutController(rootPath);
    this.getPostController(rootPath);

    this.getPatchController(resourcePath);
    this.getDeleteController(resourcePath);
    return this.app;
  }

  addDocumentLookupMiddleware() {
    this.preRoute.push(async (req, res, next) => {
      try {
        const {
          datasource,
          params: { resourceID },
        } = req;

        const doc = await datasource
          .findById(resourceID)
          .select(this.field)
          .exec();

        datasource.verifyOutput(doc);
        req.parent = doc;
        req.fieldName = this.field;
        req.subdocs = doc[this.field];
        next();
      } catch (e) {
        next(e);
      }
    });
  }

  getListController(path) {
    List.authorization = [
      redact(this.collectionName)
        .requireField(this.field)
        .inResponse(this.field)
        .withPrefix(this.field)
        .done(),
    ];

    List.validation = [
      check('resourceID')
        .isMongoId()
        .respondsWith('mongo'),
    ];

    return this.makeGet(path, List);
  }

  getPostController(path) {
    Post.authorization = [
      redact(this.collectionName)
        .requireField(this.field)
        .inRequest('body')
        .inResponse(this.field)
        .withPrefix(this.field)
        .done(),
    ];

    Post.validation = this.getChildValidationSchema();
    return this.makePost(path, Post);
  }

  getPutController(path) {
    Put.authorization = [
      redact(this.collectionName)
        .requireField(this.field)
        .inRequest('body')
        .inResponse(this.field)
        .withPrefix(this.field)
        .done(),
    ];

    Put.validation = this.getChildValidationSchema();
    return this.makePut(path, Put);
  }

  getPatchController(path) {
    Patch.authorization = [
      redact(this.collectionName)
        .requireField(this.field)
        .inRequest('body')
        .inResponse(this.field)
        .withPrefix(this.field)
        .done(),
    ];

    Patch.validation = this.getChildValidationSchema();
    return this.makePatch(path, Patch);
  }

  getDeleteController(path) {
    Remove.authorization = [redact(this.collectionName)];
    return this.makeDelete(path, Remove);
  }

  getDeleteManyController(path) {
    RemoveMany.authorization = [
      redact(this.collectionName).done(),
    ];
    RemoveMany.validation = [query('ids').isArray()];

    return this.makeDelete(path, RemoveMany);
  }
};
