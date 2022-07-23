import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  // Vérifie l'authentification avec NextAuth
  const session = await getSession({ req });
  // Si pas de session, donc pas authentifié, retourne une erreur
  if (!session) {
    return res.status(401).send({ message: 'signin required' });
  }

  const { user } = session;
  await db.connect();
  // Récupère les commandes de l'utilisateur
  const orders = await Order.find({ user: user._id });
  await db.disconnect();
  res.send(orders);
};

export default handler;
