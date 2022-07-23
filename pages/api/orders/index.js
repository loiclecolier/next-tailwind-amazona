import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  // Vérifie l'authentification avec NextAuth
  const session = await getSession({ req });
  // Si pas de session, donc pas authentifié, retourne une erreur
  if (!session) {
    return res.status(401).send('signin required');
  }

  // Récupère les infos de l'utilisateur
  const { user } = session;

  // Connexion à la base de données
  await db.connect();

  // Création d'une nouvelle commande dans la base de données
  const newOrder = new Order({
    ...req.body,
    user: user._id, // on envoie l'id car User est lié avec ref dans le modèle Order
  });
  const order = await newOrder.save();
  res.status(201).send(order);
};

export default handler;
