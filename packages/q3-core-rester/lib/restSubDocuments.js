const { Router } = require('express');
const {
  check,
  compose,
  redact,
  query,
} = require('q3-core-composer');

module.exports = ({ Model, field, collectionName }) => {
  const app = Router();

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

  PutSingle.validation = Model.getChildPaths(field);

  const Post = async (
    { t, body, marshal, params, files },
    res,
  ) => {
    const doc = await getParentResource(params.resourceID);

    if (!files) {
      await doc.pushSubDocument(field, body);
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

  Post.validation = Model.getChildPaths(field);

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

  Put.validation = Model.getChildPaths(field);

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
