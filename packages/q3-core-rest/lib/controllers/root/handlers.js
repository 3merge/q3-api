const { get } = require('lodash');
const queryParser = require('../../queryParser');
const { assignIdsOnSubDocuments } = require('../../utils');

module.exports = {
  async Get(
    { datasource, collectionSingularName, params, marshal },
    res,
  ) {
    const doc = await datasource.findStrictly(
      params.resourceID,
      {
        select: '+uploads',
      },
    );

    res.ok({
      [collectionSingularName]: marshal(doc),
    });
  },

  async List(req, res) {
    const { marshal, collectionPluralName, datasource } =
      req;

    const { query, select, limit, sort, page } =
      queryParser(req);
    try {
      const { docs, totalDocs, hasNextPage, hasPrevPage } =
        await datasource.paginate(query, {
          options: { redact: true },
          page: page >= 0 ? page + 1 : 1,
          limit: limit > 500 ? 500 : limit,
          collation: { locale: 'en' },
          lean: { virtuals: true },
          sort,
          select,
        });

      const payload = marshal(docs);

      res.ok({
        [collectionPluralName]: payload,
        total: totalDocs,
        hasNextPage,
        hasPrevPage,
      });
    } catch (e) {
      if (e.statusCode === 403) throw e;

      res.ok({
        [collectionPluralName]: [],
        total: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    }
  },

  async Patch(req, res) {
    const {
      body: originalBody,
      collectionSingularName,
      datasource,
      marshal,
      params,
      files,
    } = req;

    // @NOTE - otherwise it picks up on READ permissions
    const doc = await datasource.findStrictly(
      params.resourceID,
      {
        redact: false,
        select: '+uploads',
      },
    );

    const body = doc.authorizeUpdateArguments(originalBody);
    // ensures we don't replace sub-docs accidentally
    assignIdsOnSubDocuments(body);

    await doc.handleReq({
      body,
      files,
    });

    await doc.set(body).save({
      redact: true,
    });

    res.update({
      message: res.say('resourceUpdated'),
      [collectionSingularName]: marshal(doc),
    });
  },

  async Post(
    {
      body,
      collectionSingularName,
      datasource: Datasource,
      marshal,
    },
    res,
  ) {
    // otherwise some fields get dropped
    // cannot include partial object either without validation error
    // it's all or nothing
    const disc = get(body, '__t');
    const doc = disc
      ? new Datasource({
          __t: disc,
        })
      : new Datasource();

    doc.set(doc.authorizeCreateArguments(body));
    await doc.save({
      redact: true,
    });

    res.create({
      message: res.say('resourceCreated'),
      [collectionSingularName]: marshal(
        Array.isArray(doc) ? doc.pop() : doc,
      ),
    });
  },

  async Remove({ datasource, params }, res) {
    await datasource.archive(params.resourceID);
    res.acknowledge();
  },

  async RemoveMany({ datasource, query: { ids } }, res) {
    await datasource.archiveMany(ids);
    res.acknowledge();
  },

  async Upload({ datasource, params, files }, res) {
    const doc = await datasource.findStrictly(
      params.resourceID,
    );

    if (
      files &&
      Object.keys(files).length &&
      doc.handleFeaturedUpload &&
      doc.checkAuthorizationForTotalSubDocument(
        'featuredUpload',
      )
    ) {
      await doc.handleFeaturedUpload({ files });
    }

    res.acknowledge();
  },
};
