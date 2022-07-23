import { getSession } from 'next-auth/react';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  // Vérifie si l'utilisateur est bien authentifié
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send('signin required');
  }

  await db.connect();

  // on récupère l'order via son ID
  const order = await Order.findById(req.query.id);
  // si l'order existe
  if (order) {
    // si l'order est déjà payé, renvoie une erreur
    if (order.isPaid) {
      return res.status(400).send({ message: 'Error: order is already paid' });
    }
    // sinon, on met à jour les variables
    order.isPaid = true;
    order.paidAt = Date.now();
    // correspond à 'details' renvoyé par la promesse de la fonction capture() de PayPal
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address,
    };

    // on sauvegarde l'order
    const paidOrder = await order.save();

    await db.disconnect();

    res.send({ message: 'order paid successfully', order: paidOrder });

    // si l'order n'est pas trouvé (n'existe pas)
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Error: order not found' });
  }
};

export default handler;
