const mongoose = require('mongoose');
const { get, size } = require('lodash');

module.exports = (model) => {
  const EmailModel = get(mongoose, `models.${model}`);

  if (!EmailModel)
    throw new Error(`Unknown model ${model}`);

  return {
    async getTemplates(name) {
      return size(name)
        ? EmailModel.find({
            name,
          })
            .select('name mjml')
            .lean()
            .exec()
        : [];
    },

    async getMjml(name) {
      return get(
        await EmailModel.findOne({
          name,
        })
          .select('mjml')
          .lean()
          .exec(),
        'mjml',
        // this is empty content
        '<mjml><mj-body></mj-body></mjml>',
      );
    },
  };
};
