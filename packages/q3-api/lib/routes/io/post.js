const { get } = require('lodash');
const Scheduler = require('q3-core-scheduler');
const { compose, verify } = require('q3-core-composer');
const aws = require('../../config/aws');
const {
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
} = require('../../helpers');

const ControllerIo = setExecutableTemplateVariablesInRequest(
  async (req, res) => {
    await Scheduler.queue(
      get(req, '$executableTemplatePath'),
      {
        buckets: await aws().bulk(req.files, 'queuing'),
        datasource: get(req, '$datasource'),
        originalUrl: get(req, 'originalUrl'),
        session: get(req, '$session'),
      },
    );

    res.acknowledge();
  },
);

ControllerIo.authorization = [verify];
ControllerIo.validation = [
  setExecutableTemplatePathInRequest('chores'),
];

module.exports = compose(ControllerIo);
