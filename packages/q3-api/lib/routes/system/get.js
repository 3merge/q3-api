const { get } = require('lodash');
const { compose, verify } = require('q3-core-composer');
const mongoose = require('../../config/mongoose');

const SystemInformationController = async (req, res) => {
  const collections = Object.entries(
    get(mongoose, 'models', {}),
  ).reduce(
    (acc, [key, v]) =>
      Object.assign(acc, {
        [key]: {
          paths: v.getAllFields(),
          refs: v.getReferentialPaths(),
        },
      }),
    {},
  );

  res.ok({
    ...get(req, 'app.locals.authorization', {}),
    collections,
  });
};

SystemInformationController.authorization = [verify];
module.exports = compose(SystemInformationController);
