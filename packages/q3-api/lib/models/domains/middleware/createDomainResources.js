const { size } = require('lodash');
const Schema = require('../schema');
const DomainResources = require('../../domainsResources');

async function createDomainResources() {
  if (
    (this.isNew || this.isModified('supportedLngs')) &&
    size(this.supportedLngs)
  ) {
    const existing = await DomainResources.find({
      tenant: this.tenant,
    })
      .select('lng')
      .lean();

    const newResources = size(existing)
      ? this.supportedLngs.reduce((acc, curr) => {
          if (
            existing.findIndex(
              ({ lng }) => lng === curr,
            ) === -1
          ) {
            acc.push(curr);
          }

          return acc;
        }, [])
      : this.supportedLngs;

    if (size(newResources))
      await DomainResources.create(
        newResources.map((lng) => ({
          resource: {},
          tenant: this.tenant,
          lng,
        })),
      );
  }
}

Schema.pre('save', createDomainResources);
