import Exp, { Errors } from 'starter-e3';
import { Router } from 'express';
import { check } from 'express-validator';

export default (path, name) => (app) => {
  const routes = Router();
  const Model = Exp.model(name);
  const { ConflictError } = Errors;

  const getAddress = async ({ query, params }, res) => {
    const { documentID } = params;
    const { addresses = [] } = await Model.findById(
      documentID,
    )
      .select('addresses')
      .lean();

    res.ok({
      addresses: addresses.filter((address) =>
        query.kind ? address.kind === query.kind : address,
      ),
    });
  };

  getAddress.validation = [
    check('documentID').isMongoId(),
    check('kind')
      .isString()
      .optional(),
  ];

  const addAddress = async ({ params, body }, res) => {
    const { documentID } = params;
    const doc = await Model.findById(documentID);
    doc.addresses.push(body);
    await doc.save();

    res.update({
      message: Exp.translate('message:addressUpdated'),
      addresses: doc.addresses,
    });
  };

  const updateAddress = async ({ params, body }, res) => {
    const { documentID, addressID } = params;
    const doc = await Model.findById(documentID);
    const subdoc = doc.addresses.id(addressID);
    subdoc.set(body);
    await doc.save();

    res.update({
      message: Exp.translate('message:addressUpdated'),
      addresses: doc.addresses,
    });
  };

  const addressValidation = [
    check('documentID').isMongoId(),
    check('firstName').isString(),
    check('lastName').isString(),
    check('company').isString(),
    check('kind').isString(),
    check('streetLine1').isString(),
    check('streetLine2')
      .isString()
      .optional(),
    check('city').isString(),
    check('region').isString(),
    check('postal').isString(),
    check('country').isString(),
    check('phone1').isString(),
    check('phone2')
      .isString()
      .optional(),
    check('fax')
      .isString()
      .optional(),
    check('website')
      .isString()
      .optional(),
  ];

  addAddress.validation = addressValidation;
  updateAddress.validation = addressValidation;

  const removeAddress = async ({ params }, res) => {
    const { documentID, addressID } = params;
    const { nModified } = await Model.updateOne(
      { _id: documentID },
      {
        $pull: {
          addresses: {
            _id: addressID,
          },
        },
      },
    );

    if (!nModified)
      throw new ConflictError(
        Exp.translate('message:pullFailed'),
      );

    res.acknowledge();
  };

  removeAddress.validation = [
    check('documentID').isMongoId(),
    check('addressID').isMongoId(),
  ];

  const removeAddressesInBulk = async (
    { params, query },
    res,
  ) => {
    const { documentID } = params;
    const { ids } = query;

    const { nModified } = await Model.updateOne(
      { _id: documentID },
      {
        $pull: {
          addresses: {
            _id: {
              $in: ids,
            },
          },
        },
      },
    );

    if (!nModified)
      throw new ConflictError(
        Exp.translate('message:pullFailed'),
      );

    res.acknowledge();
  };

  removeAddress.validation = [
    check('documentID').isMongoId(),
    check('ids').isArray(),
    check('ids[]').isMongoId(),
  ];

  routes
    .route('/:documentID/addresses')
    .get(Exp.define(getAddress))
    .post(Exp.define(addAddress))
    .delete(Exp.define(removeAddressesInBulk));

  routes
    .route('/:documentID/addresses/:addressID')
    .delete(Exp.define(removeAddress))
    .put(Exp.define(updateAddress));

  app.use(`/${path}`, routes);
  return app;
};
