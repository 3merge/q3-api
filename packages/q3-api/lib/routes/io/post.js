const { get } = require('lodash');
const Scheduler = require('q3-core-scheduler');
const { compose, verify } = require('q3-core-composer');
const FileAdapater = require('q3-core-files').adapter;
const {
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
} = require('../../helpers');

const ControllerIo = setExecutableTemplateVariablesInRequest(
  async (req, res) => {
    await Scheduler.queue(
      get(req, '$executableTemplatePath'),
      {
        buckets: await FileAdapater.bulk(
          req.files,
          'queuing',
        ),
        query: get(req, '$query'),
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
