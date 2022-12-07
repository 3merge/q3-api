const DomainResourcesSchema = require('../schema');
const getMasterTenant = require('../../../helpers/getMasterTenant');

DomainResourcesSchema.pre(
  'save',
  async function takeFromDefaultLng() {
    if (this.isNew && !this.resources) {
      const lng = process.env.DEFAULT_LNG || 'en';
      const match = await this.constructor.findOne({
        tenant: getMasterTenant(),
        lng,
      });

      if (match && match.resources) {
        this.set('resources', match.resources, {
          strict: false,
        });
      }
    }
  },
);

module.exports = DomainResourcesSchema;
