/* eslint-disable func-names, no-param-reassign */
const { exception } = require('q3-api');
const schema = require('./schema');

module.exports = (collectionSchema) => {
  collectionSchema.add({
    addresses: {
      type: [schema],
      select: false,
    },
  });

  collectionSchema.statics.insertNewAddress = async function(
    id,
    body,
  ) {
    const doc = await this.findById(id).select('addresses');
    if (!doc)
      exception('ResourceNotFoundError')
        .msg('documentNotFound')
        .throw();

    if (!body)
      exception('InternalServer')
        .msg('missingBody')
        .throw();

    doc.addresses.push(body);
    const { addresses } = await doc.save();
    return addresses;
  };

  collectionSchema.statics.updateAnAddress = async function(
    id,
    addressID,
    body,
  ) {
    const doc = await this.findById(id).select('addresses');

    if (!doc || !doc.addresses.id(addressID))
      exception('ResourceNotFoundError')
        .msg('documentNotFound')
        .throw();

    doc.addresses.id(addressID).set(body);
    const { addresses } = await doc.save();
    return addresses;
  };

  collectionSchema.pre('save', function(next) {
    let err;
    if (
      this.addresses.filter((address) =>
        address ? address.kind === 'Billing' : false,
      ).length > 1
    )
      err = exception('Validation')
        .msg('multipleBillingAddresses')
        .boomerang();

    next(err);
  });
};
