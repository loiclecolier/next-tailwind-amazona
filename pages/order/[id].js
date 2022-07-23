// npm i @paypal/react-paypal-js
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';

// Gestion des états avec un reducer (et le hook useReducer) pour récupérer les informations de la commande
function reducer(state, action) {
  switch (action.type) {
    // Envoi de la requête pour les commandes
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    // Requête pour les commandes réalisée avec succès
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    // Requête pour les commandes échouée
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    // Paiement avec PayPal en cours...
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    // Paiement avec PayPal réalisé avec succès
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    // Paiement avec PayPal échoué
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload };
    // Réinitialisation du paiement avec PayPal
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    // sinon, on renvoie juste l'état
    default:
      state;
  }
}

export default function OrderScreen() {
  // on récupère de quoi utiliser PayPal
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // on récupère l'id de la commande via l'URL
  const { query } = useRouter();
  const orderId = query.id;

  // Initialisation des états de la page
  // useReducer = useState pour gérer des cas plus complexes
  const [
    // states
    { loading, error, order, successPay, loadingPay },
    // dispatch
    dispatch,
  ] = useReducer(reducer, {
    // initial states
    loading: true,
    order: {},
    error: '',
  });

  useEffect(() => {
    // fonction asynchrone pour récupérer les informations de la commande
    const fetchOrder = async () => {
      try {
        // dispatch le premier changement d'état, envoi de la requête
        dispatch({ type: 'FETCH_REQUEST' });
        // on récupère la data
        const { data } = await axios.get(`/api/orders/${orderId}`);
        // on envoie la data avec un dispatch pour faire un changement d'état avec FETCH_SUCCESS de la fonction reducer
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // en cas d'erreur, on envoie l'erreur dans le payload avec un changement d'état avec FETCH_FAIL de la fonction reducer
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    // si order._id n'existe pas
    // OU que ça a été payé avec succès avec PayPal (successPay = true)
    // OU que order_id existe ET qu'il est différent de orderId de l'URL => correspond à la précédente URL visitée d'une commande
    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      // appel de la fonction asynchrone pour récupérer la commande
      fetchOrder();

      // si ça a bien été payé, on reset pour le prochain paiement
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }

      // Si l'order existe, et qu'il ne correspond pas à une précédente order
    } else {
      // Lancement du script d'initialisation de PayPal (resetOptions)
      const loadPaypalScript = async () => {
        // Récupère l'ID Client de PayPal
        const { data: clientId } = await axios.get('/api/keys/paypal');
        // On envoie les informations à PayPal
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      // appel de la fonction pour lancer le script de PayPal
      loadPaypalScript();
    }
  }, [order, orderId, paypalDispatch, successPay]);

  // On récupère toutes les informations de order
  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  // Fonction n°1 pour le paiement avec PayPal : création de la commande
  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            // on donne à PayPal la somme de la transaction
            amount: { value: totalPrice },
          },
        ],
      }) // promesse qui renvoie l'id de la commande
      .then((orderID) => {
        return orderID;
      });
  }

  // Fonction n°2 pour le paiement avec PayPal : fonction qui approuve le paiement
  function onApprove(data, actions) {
    // confirme le paiement, l'envoie, le complète et retourne une promesse
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        // appel à l'API de paiement (voir dossier api), on lui envoie les infos
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Order is paid successfully');
      } catch (err) {
        // si erreur pendant le paiement
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }

  // Fonction n°3 pour le paiement avec PayPal : gestion des erreurs
  function onError(err) {
    toast.error(getError(err));
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className="mb-4 text-xl">{`Order ${orderId}`}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            {/* Adresse de livraison */}
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div>
                {shippingAddress.fullName}, {shippingAddress.address},{' '}
                {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                {shippingAddress.country}
              </div>
              {isDelivered ? (
                <div className="alert-success">Delivered at {deliveredAt}</div>
              ) : (
                <div className="alert-error">Not delivered</div>
              )}
            </div>

            {/* Moyen de paiement */}
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              <div>{paymentMethod}</div>
              {isPaid ? (
                <div className="alert-success">Paid at {paidAt}</div>
              ) : (
                <div className="alert-error">Not paid</div>
              )}
            </div>

            {/* Liste des produits de la commande */}
            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="p-5 text-right">Quantity</th>
                    <th className="p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <a className="flex items-center">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            ></Image>
                            &nbsp;
                            {item.name}
                          </a>
                        </Link>
                      </td>
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right">
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            {/* Résumé de la commande */}
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Items</div>
                    <div>${itemsPrice}</div>
                  </div>
                </li>{' '}
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Tax</div>
                    <div>${taxPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Shipping</div>
                    <div>${shippingPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Total</div>
                    <div>${totalPrice}</div>
                  </div>
                </li>
                {!isPaid && (
                  <li>
                    {/* isPending = variable qui vérifie le chargement du script Paypal dans la wep app  */}
                    {isPending ? (
                      <div>Loading...</div>
                    ) : (
                      <div className="w-full">
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <div>Loading...</div>}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// protected page
OrderScreen.auth = true;
