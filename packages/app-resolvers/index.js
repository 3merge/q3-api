require('../q3-api/lib/config/mongoose');
const mongoose = require('mongoose');
const validatorAdapter = require('m2e-validator');
const paginate = require('mongoose-paginate-v2');
const partialSearch = require('mongoose-partial-search');
const commonUtils = require('q3-schema-utils/plugins/common');

mongoose.plugin(commonUtils);
mongoose.plugin(partialSearch);
mongoose.plugin(validatorAdapter);
mongoose.plugin(paginate);

const clean = (o) =>
  Object.entries(o).reduce((acc, [key, v]) => {
    if (v !== null && v !== undefined)
      Object.assign(acc, { [key]: v });
    return acc;
  }, {});

module.exports = {
  async Get({ datasource, params }) {
    const doc = await datasource.findStrictly(
      params.resourceID,
      {
        select: '+uploads',
      },
    );

    return doc;
  },

  async List({
    datasource,
    query,
    select,
    limit,
    sort,
    page,
  }) {
    const { countDocuments } = datasource;
    // eslint-disable-next-line
    datasource.countDocuments = function monkeyPatchPaginationPluginInternals(
      params,
    ) {
      return countDocuments
        .call(datasource, params)
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

    return {
      data: docs,
      total: totalDocs,
      hasNextPage,
      hasPrevPage,
    };
  },

  async Patch({ body, datasource, params, files }) {
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

    return {
      data: doc,
    };
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
