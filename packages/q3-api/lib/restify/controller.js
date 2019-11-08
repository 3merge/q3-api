const { Router } = require('express');
const {
  compose,
  redact,
  check,
  query,
} = require('q3-core-composer');
const aqp = require('api-query-params');
const flatten = require('flat');

const {
  discernIfValidationSchemaIsDiscriminated,
} = require('./utils');

const reduceByObjectLength = (o) =>
  o.reduce((a, c) => {
    const keys = Object.keys(flatten(c));
    return keys.length > a.length ? keys : a;
  }, []);

const populateEmptyObjectKeys = (o, keys) =>
  o.map((p) => {
    const flat = flatten(p);
    keys.forEach((key) => {
      if (!flat[key]) flat[key] = '';
    });

    return flat;
  });

const transformObjectKeys = (arr, next) =>
  arr.map((r) =>
    Object.entries(r).reduce(
      (a, c) =>
        Object.assign(a, {
          [next(c[0].replace(/(\.\d+\.)/, '.$.'))]: c[1],
        }),
      {},
    ),
  );

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

  Post.validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema.post,
    discriminatorKey,
  );

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

  Patch.validation = discernIfValidationSchemaIsDiscriminated(
    validationSchema.patch,
    discriminatorKey,
  );

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

  const List = async (req, res) => {
    const { query: q, marshal, t } = req;
    const {
      sort,
      limit = 50,
      projection: select,
      filter: { search, page, ...where },
    } = aqp(q);

    const params = Object.assign(
      Model.searchBuilder(search),
      where,
      { active: true },
    );

    const activePage = page + 1;

    const {
      docs,
      totalDocs,
      hasNextPage,
      hasPrevPage,
    } = await Model.paginate(params, {
      page: activePage >= 1 ? activePage : 1,
      sort,
      select,
      limit,
    });

    const payload = marshal(docs);

    if (req.get('Accept') === 'text/csv') {
      const columns = reduceByObjectLength(payload);
      const rows = populateEmptyObjectKeys(
        payload,
        columns,
      );

      /**
       * @TODO
       * Access control...
       */
      res.csv(
        transformObjectKeys(rows, (v) => t(`labels:${v}`)),
        true,
      );
    } else {
      res.ok({
        [collectionPluralName]: payload,
        total: totalDocs,
        hasNextPage,
        hasPrevPage,
      });
    }
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

  const DeleteMany = async ({ query: { ids }, t }, res) => {
    await Model.updateMany(
      {
        _id: { $in: ids },
      },
      { active: false },
    );
    res.acknowledge({
      message: t('messages:resourceDeleted'),
    });
  };

  Delete.authorization = [redact(collectionName)];
  Delete.validation = [query('ids').isArray()];

  if (restify.includes('get')) {
    app.get(`/${collectionName}`, compose(List));
    app.get(`/${collectionName}/:resourceID`, compose(Get));
  }

  if (restify.includes('delete')) {
    app.delete(`/${collectionName}`, compose(DeleteMany));
    app.delete(
      `/${collectionName}/:resourceID`,
      compose(Delete),
    );
  }

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
