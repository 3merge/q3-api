const { Router } = require('express');
const { get } = require('lodash');
const {
  check,
  compose,
  redact,
  query,
} = require('q3-core-composer');
const {
  discernIfValidationSchemaIsDiscriminated,
} = require('./utils');

const constructPopulatePaths = (Model) => (doc) => {
  const fields = get(
    Model,
    'schema.options.onPopulate',
    {},
  );

  return Object.entries(fields).reduce(
    (a, [path, select], i) => {
      a.populate({ path, select });

      return i === Object.keys(fields).length - 1
        ? doc.execPopulate()
        : a;
    },
    doc,
  );
};

module.exports = ({
  Model,
  field,
  validationSchema,
  collectionName,
  discriminatorKey,
}) => {
  const app = Router();
  const populate = constructPopulatePaths(Model);

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
    await populate(doc);

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

  PutSingle.validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema.post,
    discriminatorKey,
  );

  const Post = async (
    { t, body, marshal, params, files },
    res,
  ) => {
    const doc = await getParentResource(params.resourceID);

    if (!files) {
      await doc.pushSubDocument(field, body);
      await populate(doc);
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

  Post.validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema.post,
    discriminatorKey,
  );

  const Get = async ({ marshal, params }, res) => {
    const doc = await getParentResource(params.resourceID);
    await populate(doc);

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

    await populate(doc);

    res.update({
      message: t('messages:subResourceUpdated'),
      [field]: marshal(doc[field]),
    });
  };

  Put.authorization = [
    redact(collectionName)
      .requireField(field)
      .inRequest('body')
      .inResponse(field),
  ];

  Put.validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema.patch,
    discriminatorKey,
  );

  const Delete = async ({ params }, res) => {
    const doc = await getParentResource(params.resourceID);
    await doc.removeSubDocument(field, params.fieldID);
    res.acknowledge();
  };

  Delete.authorization = [redact(collectionName)];

  const DeleteMany = async (
    { params, query: { ids } },
    res,
  ) => {
    const doc = await getParentResource(params.resourceID);
    await doc.removeSubDocument(field, ids);
    res.acknowledge();
  };

  DeleteMany.authorization = [redact(collectionName)];
  DeleteMany.validation = [query('ids').isArray()];

  app
    .route(`/${collectionName}/:resourceID/${field}`)
    .get(compose(Get))
    .put(compose(PutSingle))
    .post(compose(Post))
    .delete(compose(DeleteMany));

  app
    .route(
      `/${collectionName}/:resourceID/${field}/:fieldID`,
    )
    .get(compose(Get))
    .put(compose(Put))
    .delete(compose(Delete));

  return app;
};
