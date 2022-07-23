// /api/orders/:id

import { getSession } from 'next-auth/react';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  // Vérifie l'authentification avec NextAuth
  const session = await getSession({ req });
  // Si pas de session, donc pas authentifié, retourne une erreur
  if (!session) {
    return res.status(401).send('signin required');
  }

  await db.connect();

  // recherche de la commande avec l'id
  const order = await Order.findById(req.query.id);

  await db.disconnect();

  // envoie la commande
  res.send(order);
};

export default handler;
