import Q3 from 'q3-api';
import { check } from 'express-validator';

const CreateProduct = async ({ body }, res) => {
  const Model = Q3.model('demo-products');
  const product = await Model.create(body);
  res.create({ product });
};

CreateProduct.validation = [
  check('sku', Q3.translate('required')).isString(),
  check('price', Q3.translate('price')).isFloat(),
  check('description')
    .isString()
    .optional(),
];

export default Q3.define(CreateProduct);
