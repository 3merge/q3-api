import Q3 from 'q3-api';

const GetProducts = async (req, res) => {
  const products = await Q3.model('demo-products').find();
  res.ok({ products });
};

GetProducts.validation = [];
export default Q3.define(GetProducts);
