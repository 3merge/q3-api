const mongoose = require('mongoose');
const cluster = require('cluster');
const { map, merge, get } = require('lodash');

const requireConditionally = (path) => {
  try {
    // eslint-disable-next-line
    return require(path);
  } catch (e) {
    return {};
  }
};

module.exports = async (
  lng,
  {
    labels = {},
    descriptions = {},
    helpers = {},
    titles = {},
  },
  options = {},
) => {
  // typically only run once manually from scripts folder
  if (!cluster.isMaster) return;

  const defaultLabels = requireConditionally(
    `q3-locale/lang/${lng}/labels.json`,
  );

  const defaultHelpers = requireConditionally(
    `q3-locale/lang/${lng}/helpers.json`,
  );

  const defaultDescriptions = requireConditionally(
    `q3-locale/lang/${lng}/descriptions.json`,
  );

  const defaultTitles = requireConditionally(
    `q3-locale/lang/${lng}/titles.json`,
  );

  try {
    const { applyToAll = false, overwrite = false } =
      options;
    const doms = await mongoose.models.domainresources.find(
      {
        lng: applyToAll
          ? {
              $exists: true,
            }
          : lng,
      },
    );

    await Promise.all(
      map(doms, async (dom) => {
        const { resources } = dom;

        const facilitateMerge = (a, b, c) =>
          overwrite
            ? // takes our custom ones last
              merge({}, a, c, b)
            : merge({}, a, b, c);

        await dom.updateOne({
          resources: {
            labels: facilitateMerge(
              defaultLabels,
              labels,
              get(resources, 'labels'),
            ),
            descriptions: facilitateMerge(
              defaultDescriptions,
              descriptions,
              get(resources, 'descriptions'),
            ),
            titles: facilitateMerge(
              defaultTitles,
              titles,
              get(resources, 'titles'),
            ),
            helpers: facilitateMerge(
              defaultHelpers,
              helpers,
              get(resources, 'helpers'),
            ),
          },
        });
      }),
    );

    // eslint-disable-next-line
    console.log('Finished');
  } catch (e) {
    // eslint-disable-next-line
    console.log('Failed to seed locale:', e);
  }
};
