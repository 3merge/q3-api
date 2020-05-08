const aqp = require('api-query-params');
const read = require('url');
const {
  getColumnsHeadersFromPayload,
  populateEmptyObjectKeys,
  transformArraysInDotNotation,
  castObjectIds,
} = require('../../utils');

module.exports = {
  async Get(
    { datasource, collectionSingularName, params, marshal },
    res,
  ) {
    const doc = await datasource.findStrictly(
      params.resourceID,
    );

    res.ok({
      [collectionSingularName]: marshal(doc),
    });
  },

  async List(req, res) {
    const {
      t,
      marshal,
      collectionPluralName,
      originalUrl,
      datasource,
    } = req;

    const { query: q } = read.parse(originalUrl, true);

    const {
      sort,
      limit = 25,
      projection: select,
      filter: { search, page, ...where },
    } = aqp(q !== null ? q : {});

    const regex = datasource.searchBuilder(search) || {};
    const params = Object.assign(
      regex,
      castObjectIds(where),
      {
        active: true,
      },
    );

    const {
      docs,
      totalDocs,
      hasNextPage,
      hasPrevPage,
    } = await datasource.paginate(params, {
      options: { redact: true },
      page: page >= 0 ? page + 1 : 1,
      collation: { locale: 'en' },
      lean: { virtuals: true },
      sort,
      select,
      limit,
    });

    const payload = marshal(docs);

    if (req.get('Accept') === 'text/csv') {
      const columns = getColumnsHeadersFromPayload(payload);
      const rows = populateEmptyObjectKeys(
        payload,
        columns,
      );

      res.csv(
        transformArraysInDotNotation(rows, (v) =>
          t(`labels:${v}`),
        ),
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
  },

  async Patch(
    {
      body,
      collectionSingularName,
      datasource,
      marshal,
      params,
      isFresh,
    },
    res,
  ) {
    // @NOTE - otherwise it picks up on READ permissions
    const doc = await datasource.findStrictly(
      params.resourceID,
      { redact: false },
    );

    doc.snapshotChange(
      Object.entries(body).reduce((acc, [key, v]) => {
        if (v !== null && v !== undefined)
          Object.assign(acc, { [key]: v });
        return acc;
      }, {}),
    );

    isFresh(doc.updatedAt);

    await doc.save({
      redact: true,
      op: 'Update',
    });

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
