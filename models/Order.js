import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // référence au modèle 'User'
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // tableau d'objets produit
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    // objet adresse de livraison
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    // autres informations
    paymentMethod: { type: String, required: true },
    paymentResult: {
      // infos de paiement
      id: String,
      status: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Si le modèle a déjà été créé, on fait juste mongoose.models.Order
// Si pas, on le crée en avec mongoose.model('Order', orderSchema)
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
