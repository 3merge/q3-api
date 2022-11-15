const { get, reduce } = require('lodash');
const queryParser = require('../../queryParser');
const { assignIdsOnSubDocuments } = require('../../utils');

/**
 * @NOTE
 * Allows us to share with PatchMany with increasing test coverage.
 */
const runDocumentUpdateWorkflowById = async (
  Model,
  id,
  req = {},
  options = {},
) => {
  const { body: originalBody, files, marshal } = req;
  const { processFiles = true } = options;

  const doc = await Model.findStrictly(id, {
    redact: false,
    select: '+uploads',
  });

  const body = doc.authorizeUpdateArguments(originalBody);
  // ensures we don't replace sub-docs accidentally
  assignIdsOnSubDocuments(body);

  if (processFiles)
    await doc.handleReq({
      body,
      files,
    });

  await doc.set(body).save({
    redact: true,
  });

  return marshal(doc);
};

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
          options: { redact: true, strictQuery: false },
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
    const { collectionSingularName, datasource, params } =
      req;

    res.update({
      message: res.say('resourceUpdated'),
      [collectionSingularName]:
        await runDocumentUpdateWorkflowById(
          datasource,
          params.resourceID,
          req,
        ),
    });
  },

  async PatchMany(req, res) {
    const {
      collectionPluralName,
      datasource,
      query: { ids },
    } = req;

    res.update({
      message: res.say('resourcesUpdated'),
      [collectionPluralName]: await Promise.allSettled(
        [ids]
          .flat()
          .filter(Boolean)
          .map((id) =>
            runDocumentUpdateWorkflowById(
              datasource,
              id,
              req,
              {
                processFiles: false,
              },
            ),
          ),
      ).then((values) =>
        reduce(
          values,
          (acc, curr) => {
            // ignore errors
            if (curr.status === 'fulfilled')
              acc.push(curr.value);

            return acc;
          },
          [],
        ),
      ),
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
