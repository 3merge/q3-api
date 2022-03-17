const UserModel = require('q3-schema-users');
const { compact } = require('lodash');
const Domains = require('../../domains');

async function populateDefaultListenOptions() {
  try {
    if (this.isNew) {
      const d = await Domains.findOne({
        tenant: this.tenant,
      })
        .lean()
        .select('listeners')
        .exec();

      this.listens = compact(d.listens[this.role]);
    }
  } catch (e) {
    // noop
  }
}

UserModel.pre('save', populateDefaultListenOptions);

module.exports = {
  populateDefaultListenOptions,
};
