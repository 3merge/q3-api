import Q3 from 'q3-api';
import { permit, redact } from 'q3-api-plugin-roles';

const GetProducts = async (req, res) => {
  const products = await Q3.model('demo-products').find();
  res.ok({ products });
};

GetProducts.authorization = [
  permit('demo-products'),
  redact('request'),
  redact('response', 'products'),
];

export default Q3.define(GetProducts);
