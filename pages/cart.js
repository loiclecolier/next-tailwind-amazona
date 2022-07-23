import axios from 'axios';
import React, { useContext } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
/* From heroicons (heroicons.com) : npm i @heroicons/react */
import { XCircleIcon } from '@heroicons/react/outline';
/* dynamic pour utiliser les cookies avec le SSR (Server Side Rendering) */
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

function CartScreen() {
  const router = useRouter();

  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  // Supprimer un item du panier
  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  // Mettre à jour la quantité d'un item du panier
  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty); // convertit qty string en number

    // Pour s'assurer qu'on a la quantité suffisante niveau backend
    // on récupère le produit grâce à une requête Ajax avec axios
    const { data } = await axios.get(`/api/products/${item._id}`);
    // Vérifie si la quantité n'est pas plus grande que le nombre de produits en stock
    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });

    toast.success('Product updated in the cart');
  };

  return (
    <Layout title="Shopping Cart">
      <h1 className="mb-4 text-xl font-medium">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-5 text-left">Item</th>
                  <th className="p-5 text-right">Quantity</th>
                  <th className="p-5 text-right">Price</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.slug} className="border-b">
                    <td>
                      <Link href={`/product/${item.slug}`}>
                        <a className="flex items-cent">
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
                    <td className="p-5 text-right">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartHandler(item, e.target.value)
                        }
                      >
                        {/* Affiche des options de quantités (dans un select) en fonction du stock restant */}
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-5 text-right">${item.price}</td>
                    <td className="p-5 text-center">
                      <button onClick={() => removeItemHandler(item)}>
                        {/* From heroicons (heroicons.com) */}
                        {/* npm i @heroicons/react */}
                        <XCircleIcon className="h-5 w-5"></XCircleIcon>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-5">
            <ul>
              <li>
                <div className="pb-3 text-xl">
                  {/* Calcul de la quantité et du sous-total du panier ($) */}
                  Subtotal ( {cartItems.reduce((a, c) => a + c.quantity, 0)} ) :
                  ${cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                </div>
              </li>
              <li>
                <button
                  // Vérifie si authentifié, si oui => shipping, si non => login
                  onClick={() => router.push('login?redirect=/shipping')}
                  className="primary-button w-full"
                >
                  Check Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}

// On exporte le composant ici avec dynamic pour utiliser les cookies avec le SSR (Server Side Rendering)
export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
