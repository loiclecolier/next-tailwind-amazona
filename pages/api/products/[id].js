import Product from '../../../models/Product';
import db from '../../../utils/db';

const handler = async (req, res) => {
  await db.connect();

  // recherche du produit selon une requête (axios.get(`/api/products/${product._id}`) par exemple) selon l'ID du produit
  const product = await Product.findById(req.query.id);

  await db.disconnect();

  // on envoie le produit
  res.send(product);
};

export default handler;
