const mongoose = require('mongoose');
const cluster = require('cluster');
const { map, merge, get } = require('lodash');
const defaultLabels = require('q3-locale/lang/en/labels.json');
const defaultHelpers = require('q3-locale/lang/en/helpers.json');
const defaultDescriptions = require('q3-locale/lang/en/descriptions.json');
const defaultTitles = require('q3-locale/lang/en/titles.json');

module.exports = async ({
  labels = {},
  descriptions = {},
  helpers = {},
  titles = {},
}) => {
  // typically only run once manually from scripts folder
  if (!cluster.isMaster) return;

  try {
    const doms = await mongoose.models.domains.find({});

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
