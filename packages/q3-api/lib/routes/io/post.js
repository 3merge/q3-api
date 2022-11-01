const { get } = require('lodash');
const Scheduler = require('q3-core-scheduler');
const { compose } = require('q3-core-composer');
const aws = require('../../config/aws');
const {
  checkAccessByFileNameAndRoleType,
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
} = require('../../helpers');

const ControllerIo =
  setExecutableTemplateVariablesInRequest(
    async (req, res) => {
      const settings = checkAccessByFileNameAndRoleType(
        req,
        'q3-access-chores.json',
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
