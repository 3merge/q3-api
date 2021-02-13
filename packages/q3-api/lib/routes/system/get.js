const { get } = require('lodash');
const { compose, verify } = require('q3-core-composer');
const Mailer = require('q3-core-mailer');
const { mongoose } = require('q3-adapter-mongoose');

const SystemInformationController = async (req, res) => {
  const collections = Object.entries(
    get(mongoose, 'models', {}),
  ).reduce(
    (acc, [key, v]) =>
      'getAllFields' in v
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
        : acc,
    {},
  );

  res.ok({
    ...get(req, 'app.locals.authorization', {}),
    events: Mailer.get(),
    collections,
  });
};

SystemInformationController.authorization = [verify];
module.exports = compose(SystemInformationController);
