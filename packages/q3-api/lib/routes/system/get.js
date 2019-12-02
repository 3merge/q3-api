const { get } = require('lodash');
const { compose, verify } = require('q3-core-composer');
const events = require('../../events/emitter');
const mongoose = require('../../config/mongoose');

const SystemInformationController = async (req, res) => {
  const collections = Object.entries(
    get(mongoose, 'models', {}),
  ).reduce((acc, [key, v]) => {
    return 'getAllFields' in v
      ? Object.assign(acc, {
          [key]: v
            ? {
                paths: v.getAllFields(),
                refs: v.getReferentialPaths(),
              }
            : {
                paths: [],
                refs: [],
              },
        })
      : acc;
  }, {});

  res.ok({
    ...get(req, 'app.locals.authorization', {}),
    events: events.eventNames(),
    collections,
  });
};

SystemInformationController.authorization = [verify];
module.exports = compose(SystemInformationController);
