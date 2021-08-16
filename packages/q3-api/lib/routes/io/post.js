const { find, get, isObject } = require('lodash');
const { exception } = require('q3-core-responder');
const Scheduler = require('q3-core-scheduler');
const { compose } = require('q3-core-composer');
const {
  findFileTraversingUpwards,
} = require('q3-schema-utils');
const aws = require('../../config/aws');
const {
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
} = require('../../helpers');

const checkIoSettingsByRoleType = (
  settings,
  userRoleType = 'Public',
) => {
  if (
    isObject(settings) &&
    Array.isArray(settings.role) &&
    !settings.role.includes(userRoleType)
  )
    exception('Authorization')
      .msg('cannotQueueThisChore')
      .throw();
};

const ControllerIo =
  setExecutableTemplateVariablesInRequest(
    async (req, res) => {
      const settings = find(
        findFileTraversingUpwards(
          get(req, 'app.locals.location'),
          'q3-access-chores.json',
        ),
        (item) => item.name === get(req, 'query.template'),
      );

      checkIoSettingsByRoleType(
        settings,
        get(req, 'user.role'),
      );

      await Scheduler.queue(
        get(req, '$executableTemplatePath'),
        {
          buckets: await aws().bulk(req.files, 'queuing'),
          datasource: get(req, '$datasource'),
          originalUrl: get(req, 'originalUrl'),
          session: get(req, '$session'),
        },
        get(settings, 'priority', 1),
      );

      res.acknowledge();
    },
  );

ControllerIo.validation = [
  setExecutableTemplatePathInRequest('chores'),
];

module.exports = compose(ControllerIo);
