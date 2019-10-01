const Q3 = require('q3-api').default;
const { Errors, compose } = require('q3-api');
const { Router } = require('express');
const { check } = require('express-validator');
const {
  assignFilesToPublic,
  assignFilesToPrivate,
} = require('./middleware');
const {
  PRIVATE_FILES,
  PUBLIC_FILES,
} = require('./constants');

module.exports = (name, inject) => {
  const Model = Q3.model(name);
  const routes = Router();

  const getDocument = async (id) => {
    const doc = await Model.findById(id);
    if (!doc)
      throw new Errors.ResourceNotFoundError(
        Q3.translate('validations:fileManagerNotFound'),
      );

    return doc;
  };

  const validation = (files) => [
    check('documentID')
      .isMongoId()
      .withMessage((v, { req }) =>
        req.translate('validations:mongoId'),
      ),
    check(files).custom((v, { req }) => {
      if (!v || !Object.keys(v).length)
        throw new Error(
          req.translate('validations:filesLength'),
        );

      return true;
    }),
  ];

  const PushToPublic = async (
    { params: { documentID }, body: { publicFiles } },
    res,
  ) => {
    const doc = await getDocument(documentID);
    res.create(await doc.handlePublicFiles(publicFiles));
  };

  const PushToPrivate = async (
    { params: { documentID }, body: { privateFiles } },
    res,
  ) => {
    const doc = await getDocument(documentID);
    res.create(await doc.handlePublicFiles(privateFiles));
  };

  PushToPublic.validation = validation(PUBLIC_FILES);
  PushToPrivate.validation = validation(PRIVATE_FILES);

  // Likely for RBAC or similar auth middleware
  // Must load after re-assigning req.body
  const pushIntoRoute = () => (inject ? [inject] : []);

  routes.post(
    '/:documentID/public',
    compose([
      assignFilesToPublic,
      ...pushIntoRoute(),
      Q3.define(PushToPublic),
    ]),
  );

  routes.post(
    '/:documentID/private',
    compose([
      assignFilesToPrivate,
      ...pushIntoRoute(),
      Q3.define(PushToPrivate),
    ]),
  );

  return routes;
};
