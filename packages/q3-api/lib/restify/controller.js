const { Router } = require('express');
const {
  compose,
  redact,
  check,
} = require('q3-core-composer');
const aqp = require('api-query-params');

const {
  discernIfValidationSchemaIsDiscriminated,
} = require('./utils');

module.exports = ({
  Model,
  restify,
  validationSchema,
  collectionName,
  collectionPluralName,
  collectionSingularName,
  discriminatorKey,
}) => {
  const app = Router();
  const validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema,
    discriminatorKey,
  );

  const Post = async ({ body, marshal, t }, res) => {
    const doc = await Model.create(body);
    res.create({
      message: t('messages:resourceCreated'),
      [collectionSingularName]: marshal(doc),
    });
  };

  Post.authorization = [
    redact(collectionName)
      .inRequest('body')
      .inResponse(collectionSingularName),
  ];

  Post.validation = validation;

  const Patch = async (
    { body, marshal, params, t },
    res,
  ) => {
    const doc = await Model.findStrictly(params.resourceID);
    const output = await doc.set(body).save();
    res.update({
      message: t('messages:resourceUpdated'),
      [collectionSingularName]: marshal(output),
    });
  };

  Patch.authorization = [
    redact(collectionName)
      .inRequest('body')
      .inResponse(collectionSingularName),
  ];

  Patch.validation = validation;

  const PostFile = async ({ params, files }, res) => {
    const doc = await Model.findStrictly(params.resourceID);
    if (
      files &&
      Object.keys(files).length &&
      doc.handleFeaturedUpload
    ) {
      await doc.handleFeaturedUpload({ files });
    }

    res.acknowledge();
  };

  PostFile.authorization = [
    redact(collectionName).requireField('featuredUpload'),
  ];

  const List = async ({ query, marshal }, res) => {
    const {
      sort,
      limit = 50,
      skip = 1,
      projection: select,
      filter: { search, ...where },
    } = aqp(query);

    const params = Object.assign(
      Model.searchBuilder(search),
      where,
      { active: true },
    );

    console.log(params.$or[0]);

    const {
      docs,
      totalDocs,
      hasNextPage,
      hasPrevPage,
    } = await Model.paginate(params, {
      page: skip > 0 ? skip : 1,
      sort,
      select,
      limit,
    });

    res.ok({
      [collectionPluralName]: marshal(docs),
      total: totalDocs,
      hasNextPage,
      hasPrevPage,
    });
  };

  List.authorization = [
    redact(collectionName)
      .inRequest('query')
      .inResponse(collectionPluralName),
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

  const Get = async ({ params, marshal }, res) => {
    const doc = await Model.findStrictly(params.resourceID);

    res.ok({
      [collectionSingularName]: marshal(doc),
    });
  };

  Get.authorization = [
    redact(collectionName)
      .inRequest('query')
      .inResponse(collectionSingularName),
  ];

  const Delete = async ({ params, t }, res) => {
    await Model.archive(params.resourceID);
    res.acknowledge({
      message: t('messages:resourceDeleted'),
    });
  };

  Delete.authorization = [redact(collectionName)];

  /**
   * Let's assign the controllers now.
   * @NOTE Get will control both singular and plural.
   */

  if (restify.includes('get')) {
    app.get(`/${collectionName}`, compose(List));
    app.get(`/${collectionName}/:resourceID`, compose(Get));
  }

  if (restify.includes('delete'))
    app.delete(
      `/${collectionName}/:resourceID`,
      compose(Delete),
    );

  if (restify.includes('post')) {
    app.post(`/${collectionName}`, compose(Post));
    app.post(
      `/${collectionName}/:resourceID`,
      compose(PostFile),
    );
  }

  if (restify.includes('patch'))
    app.patch(
      `/${collectionName}/:resourceID`,
      compose(Patch),
    );

  return app;
};
