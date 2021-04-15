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
  PatchMany,
  Remove,
  RemoveMany,
} = require('./handlers');
const deco = require('./handlerDecorator');

const appendValidationForMultiOp = (ctrl) => {
  // eslint-disable-next-line
  ctrl.validation = [query('ids').isArray()];
  return ctrl;
};

module.exports = class SubDocumentControllerCommander extends (
  RestRegistration
) {
  exec() {
    const rootPath = this.getNestedPathName();
    const resourcePath = this.getNestedResourcePathName();
    this.addDocumentLookupMiddleware();

    this.getListController(rootPath);
    this.getDeleteManyController(rootPath);
    this.getPatchManyController(rootPath);

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

        const service = datasource.findById(resourceID);

        const doc = await service
          .select(`+${this.field}`)
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

  getAuthorization() {
    return [
      redact(this.collectionName)
        .requireField(this.field)
        .inRequest('body')
        .inResponse(this.field)
        .withPrefix(this.field)
        .done(),

      redact(this.collectionName).inResponse('full').done(),
    ];
  }

  decorateController(Ctrl) {
    // eslint-disable-next-line
    Ctrl.authorization = this.getAuthorization();
    // eslint-disable-next-line
    Ctrl.validation = this.getChildValidationSchema();
    return deco(Ctrl);
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
      check('resourceID').isMongoId().respondsWith('mongo'),
    ];

    return this.makeGet(path, List);
  }

  getPostController(path) {
    return this.makePost(
      path,
      this.decorateController(Post),
    );
  }

  getPutController(path) {
    return this.makePut(path, this.decorateController(Put));
  }

  getPatchController(path) {
    return this.makePatch(
      path,
      this.decorateController(Patch),
    );
  }

  getPatchManyController(path) {
    PatchMany.authorization = this.getAuthorization();
    appendValidationForMultiOp(PatchMany);
    return this.makePatch(path, deco(PatchMany));
  }

  getDeleteController(path) {
    Remove.authorization = this.getAuthorization();
    return this.makeDelete(path, deco(Remove));
  }

  getDeleteManyController(path) {
    RemoveMany.authorization = this.getAuthorization();
    appendValidationForMultiOp(RemoveMany);
    return this.makeDelete(path, deco(RemoveMany));
  }
};
