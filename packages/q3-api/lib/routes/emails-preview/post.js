const {
  verify,
  compose,
  redact,
  check,
} = require('q3-core-composer');
const Mailer = require('q3-core-mailer/lib/core');
const { Emails } = require('../../models');

const model = Emails.collection.collectionName;

const EmailsPreviewPost = async ({ body, t }, res) => {
  try {
    res.ok({
      html: await Mailer.preview(body.mjml, {
        model,
        variables: body.variables,
      }),
    });
  } catch (e) {
    res.ok({
      message: e.message,
      html: `<html>
        <body>
          <p>${t('messages:failedToRenderPreview')}</p>
        </body>
      </html>`,
    });
  }
};

EmailsPreviewPost.authorization = [
  verify,
  redact(model).enforceGrant().done(),
];

EmailsPreviewPost.validation = [
  check('mjml').isString(),
  check('variables').isObject().optional(),
];

module.exports = compose(EmailsPreviewPost);
