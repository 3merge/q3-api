import { mongoose } from 'q3-api';
import withFeaturedPhoto from 'q3-api-plugin-files/lib/model/plugin';
import { Schema } from 'mongoose';

const Product = new Schema(
  {
    sku: String,
    price: Number,
    description: String,
  },
  {
    ownership: true,
  },
);

Product.plugin(withFeaturedPhoto);
mongoose.model('demo-products', Product);
