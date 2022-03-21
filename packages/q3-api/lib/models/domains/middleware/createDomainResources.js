const { forEach, map, pick, size } = require('lodash');
const mongoose = require('mongoose');
const Schema = require('../schema');
const DomainResources = require('../../domainsResources');

const getEmailModel = () => {
  const name = process.env.EMAIL_COLLECTION || 'emails';
  return mongoose.models[name];
};

async function createDomainResources() {
  if (this.hasChangedLanguage()) {
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

async function createEmailTemplates() {
  const EmailModel = getEmailModel();

  if (this.hasChangedLanguage() && EmailModel) {
    const bulk =
      EmailModel.collection.initializeUnorderedBulkOp();

    // assumes english is the starting language
    const baseEmailTemplates = await EmailModel.find({
      name: [/^en-/, /^__en-/],
      tenant: this.tenant,
    })
      .lean()
      .exec();

    try {
      await Promise.all(
        map(this.supportedLngs, async (lng) => {
          if (lng === 'en') return;

          forEach(baseEmailTemplates, (email) => {
            const name = email.name.replace(
              'en-',
              `${lng}-`,
            );

            bulk
              .find({
                name,
              })
              .upsert()
              .update({
                $setOnInsert: {
                  ...pick(email, [
                    'name',
                    'mjml',
                    'variables',
                    'tenant',
                    'active',
                  ]),
                  name,
                },
                $set: {},
              });
          });
        }),
      );

      if (size(baseEmailTemplates)) {
        await bulk.execute();
      }
    } catch (e) {
      // noop
    }
  }
}

Schema.pre('save', createDomainResources);
Schema.pre('save', createEmailTemplates);
