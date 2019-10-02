import Q3 from 'q3-api';
import { check } from 'express-validator';

const UpdateProduct = async (
  { body: { files }, params: { productsID } },
  res,
) => {
  const Model = Q3.model('demo-products');
  const product = await Model.findById(productsID);

  res.ok({
    url: await product.setFeaturedPhoto(files.photo),
  });
};

UpdateProduct.validation = [
  check('productsID').isMongoId(),
  check('files').custom((v) => v && 'photo' in v),
];

export default Q3.define(UpdateProduct);
