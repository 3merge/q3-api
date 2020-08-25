const queryParser = require('../../queryParser');

const clean = (o) =>
  Object.entries(o).reduce((acc, [key, v]) => {
    if (v !== null && v !== undefined)
      Object.assign(acc, { [key]: v });
    return acc;
  }, {});

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
    const {
      marshal,
      collectionPluralName,
      datasource,
    } = req;

    const {
      query,
      select,
      limit,
      sort,
      page,
    } = queryParser(req);

    // save original so we can restore later
    datasource.$$countDocuments = datasource.countDocuments;

    // otherwise the counter doesn't redact
    datasource.countDocuments = function monkeyPatchPaginationPluginInternals(
      params,
    ) {
      return datasource
        .$$countDocuments(params)
        .setOptions({
          redact: true,
        });
    };

    const {
      docs,
      totalDocs,
      hasNextPage,
      hasPrevPage,
    } = await datasource.paginate(query, {
      options: { redact: true },
      page: page >= 0 ? page + 1 : 1,
      limit: limit > 500 ? 500 : limit,
      collation: { locale: 'en' },
      lean: { virtuals: true },
      sort,
      select,
    });

    // must re-assigned afterwards
    datasource.countDocuments = datasource.$$countDocuments;

    const payload = marshal(docs);

    res.ok({
      [collectionPluralName]: payload,
      total: totalDocs,
      hasNextPage,
      hasPrevPage,
    });
  },

  async Patch(
    {
      body,
      collectionSingularName,
      datasource,
      marshal,
      params,
      isFresh,
      files,
    },
    res,
  ) {
    // @NOTE - otherwise it picks up on READ permissions
    const doc = await datasource.findStrictly(
      params.resourceID,
      {
        redact: false,
        select: '+uploads',
      },
    );

    await doc.handleReq({
      body,
      files,
    });

    await doc.snapshotChange(clean(body)).save({
      redact: true,
      op: 'Update',
    });

    isFresh(doc.updatedAt);

    res.update({
      message: res.say('resourceUpdated'),
      [collectionSingularName]: marshal(doc),
    });
  },

  async Post(
    { body, collectionSingularName, datasource, marshal },
    res,
  ) {
    const doc = await datasource.create([body], {
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
      doc.handleFeaturedUpload
    ) {
      await doc.handleFeaturedUpload({ files });
    }

    res.acknowledge();
  },
};
