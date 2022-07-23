import { getSession } from 'next-auth/react';

const handler = async (req, res) => {
  // Vérifie si l'utilisateur est bien authentifié
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send('signin required');
  }

  // Envoie l'ID Client de PayPal, si inexistant, envoie 'sb'
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
};

export default handler;
