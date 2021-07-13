const { get } = require('lodash');
const { compose, verify } = require('q3-core-composer');
const {
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
} = require('../../helpers');

const ControllerReports =
  setExecutableTemplateVariablesInRequest(
    async (req, res) =>
      res.ok({
        // eslint-disable-next-line
        data: await require(get(
          req,
          '$executableTemplatePath',
        ))(get(req, '$query'), get(req, '$session')),
      }),
  );

ControllerReports.authorization = [verify];

ControllerReports.validation = [
  setExecutableTemplatePathInRequest('reports'),
];

module.exports = compose(ControllerReports);
