import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Si le modèle a déjà été créé, on fait juste mongoose.models.Product
// Si pas, on le crée en avec mongoose.model('Product', productSchema)
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
