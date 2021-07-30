const queryParser = require('../../queryParser');

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
    const doc = new Datasource();

    await doc
      .set(doc.authorizeCreateArguments(body))
      .save({ redact: true });

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
      doc.handleFeaturedUpload
    ) {
      await doc.handleFeaturedUpload({ files });
    }

    res.acknowledge();
  },
};
