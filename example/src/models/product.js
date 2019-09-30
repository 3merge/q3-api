import { mongoose } from 'q3-api';
import { Schema } from 'mongoose';

const Product = new Schema({
  sku: String,
  price: Number,
  description: String,
});

mongoose.model('demo-products', Product);
