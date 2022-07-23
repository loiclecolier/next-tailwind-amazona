import Product from '../../models/Product';
import User from '../../models/User';
import data from '../../utils/data';
import db from '../../utils/db';

const handler = async (req, res) => {
  // connexion à la DB
  await db.connect();
  // on supprime tous les utilisateurs précédents de la collection (= table)
  await User.deleteMany();
  // on ajoute les utilisateurs du fichier data.js
  await User.insertMany(data.users);
  // on supprime tous les produits précédents de la collection (= table)
  await Product.deleteMany();
  // on ajoute les produits du fichier data.js
  await Product.insertMany(data.products);
  // déconnexion
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
};

export default handler;
