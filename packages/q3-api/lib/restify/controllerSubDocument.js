const { Router } = require('express');
const {
  check,
  compose,
  redact,
} = require('q3-core-composer');
const {
  discernIfValidationSchemaIsDiscriminated,
} = require('./utils');

module.exports = ({
  Model,
  field,
  validationSchema,
  collectionName,
  discriminatorKey,
}) => {
  const app = Router();
  const validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema,
    discriminatorKey,
  );

  const getParentResource = async (id) => {
    const doc = await Model.findById(id)
      .select(field)
      .exec();

    Model.verifyOutput(doc);
    return doc;
  };

  const PutSingle = async (
    { t, body, marshal, params },
    res,
  ) => {
    const doc = await getParentResource(params.resourceID);
    await doc.set({ [field]: body }).save();
    await doc.populate().execPopulate();

    res.create({
      message: t('messages:newSubResourceAdded'),
      [field]: marshal(doc[field]),
    });
  };

  PutSingle.authorization = [
    redact(collectionName)
      .requireField(field)
      .inRequest('body')
      .inResponse(field),
  ];

  PutSingle.validation = validation;

  const Post = async (
    { t, body, marshal, params, files },
    res,
  ) => {
    const doc = await getParentResource(params.resourceID);

    if (!files) {
      await doc.pushSubDocument(field, body);
      await doc.populate().execPopulate();
    } else {
      await doc.handleUpload({ files, ...body });
    }

    res.create({
      message: t('messages:newSubResourceAdded'),
      [field]: marshal(doc[field]),
    });
  };

  Post.authorization = [
    redact(collectionName)
      .requireField(field)
      .inRequest('body')
      .inResponse(field),
  ];

  Post.validation = validation;

  const Get = async ({ marshal, params }, res) => {
    const doc = await getParentResource(params.resourceID);
    res.ok({
      [field]: marshal(doc[field]),
    });
  };

  Get.authorization = [
    redact(collectionName)
      .requireField(field)
      .inResponse(field),
  ];

  Get.validation = [
    check('resourceID')
      .isMongoId()
      .respondsWith('mongo'),
  ];

  const Put = async ({ marshal, params, body, t }, res) => {
    const doc = await getParentResource(params.resourceID);

    await doc.updateSubDocument(
      field,
      params.fieldID,
      body,
    );

    const populated = await doc.populate().execPopulate();

    res.update({
      message: t('messages:subResourceUpdated'),
      [field]: marshal(populated[field]),
    });
  };

  Put.authorization = [
    redact(collectionName)
      .requireField(field)
      .inRequest('body')
      .inResponse(field),
  ];

  Put.validation = validation;

  const Delete = async ({ params }, res) => {
    const doc = await getParentResource(params.resourceID);
    await doc.removeSubDocument(field, params.fieldID);
    res.acknowledge();
  };

  Delete.authorization = [redact(collectionName)];

  app
    .route(`/${collectionName}/:resourceID/${field}`)
    .get(compose(Get))
    .put(compose(PutSingle))
    .post(compose(Post));

  app
    .route(
      `/${collectionName}/:resourceID/${field}/:fieldID`,
    )
    .get(compose(Get))
    .put(compose(Put))
    .delete(compose(Delete));

  return app;
};
