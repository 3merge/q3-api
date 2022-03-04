const mongoose = require('mongoose');
const cluster = require('cluster');
const { map, merge, get } = require('lodash');

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

  // eslint-disable-next-line
  const defaultLabels = require(`q3-locale/lang/${lng}/labels.json`);
  // eslint-disable-next-line
  const defaultHelpers = require(`q3-locale/lang/${lng}/helpers.json`);
  // eslint-disable-next-line
  const defaultDescriptions = require(`q3-locale/lang/${lng}/descriptions.json`);
  // eslint-disable-next-line
  const defaultTitles = require(`q3-locale/lang/${lng}/titles.json`);

  try {
    const { applyToAll = false } = options;
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

        await dom.updateOne({
          resources: {
            labels: merge(
              {},
              defaultLabels,
              labels,
              get(resources, 'labels'),
            ),
            descriptions: merge(
              {},
              defaultDescriptions,
              descriptions,
              get(resources, 'descriptions'),
            ),
            titles: merge(
              {},
              defaultTitles,
              titles,
              get(resources, 'titles'),
            ),
            helpers: merge(
              {},
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
