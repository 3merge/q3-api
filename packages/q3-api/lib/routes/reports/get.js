const { get } = require('lodash');
const { compose, verify } = require('q3-core-composer');
const {
  checkAccessByFileNameAndRoleType,
  setExecutableTemplateVariablesInRequest,
  setExecutableTemplatePathInRequest,
} = require('../../helpers');

const ControllerReports =
  setExecutableTemplateVariablesInRequest(
    async (req, res) => {
      checkAccessByFileNameAndRoleType(
        req,
        'q3-access-reports.json',
      );

      res.ok({
        // eslint-disable-next-line
        data: await require(get(
          req,
          '$executableTemplatePath',
        ))(get(req, '$query'), get(req, '$session')),
      });
    },
  );

ControllerReports.authorization = [verify];

ControllerReports.validation = [
  setExecutableTemplatePathInRequest('reports'),
];

module.exports = compose(ControllerReports);
