import Head from 'next/head';
import Link from 'next/link';
import React, { useContext, useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
// npm i react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Store } from '../utils/Store';
// npm install @headlessui/react
import { Menu } from '@headlessui/react';
import DropdownLink from './DropdownLink';
import Cookies from 'js-cookie';

export default function Layout({ title, children }) {
  // Récupère les informations de la session (session est un alias de data)
  const { status, data: session } = useSession();

  const { state, dispatch } = useContext(Store);
  // Récupère l'état du panier
  const { cart } = state;

  const [cartItemsCount, setCartItemsCount] = useState(0);
  // On utilise useEffect pour mettre à jour l'état côté client (évite les erreurs de SSR avec les cookies)
  useEffect(() => {
    // Calcul de la quantité d'items dans le panier
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  // Fonction de déconnexion
  const logoutClickHandler = () => {
    Cookies.remove('cart'); // supprime les cookies du panier
    dispatch({ type: 'CART_RESET' }); // on reset le panier
    signOut({ callbackUrl: '/login' }); // déconnecte et redirige vers /login
  };

  return (
    <>
      <Head>
        <title>{title ? title + ' - Amazona' : 'Amazona'}</title>
        <meta name="description" content="Ecommerce website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <div className="flex min-h-screen flex-col justify-between">
        <header>
          <nav className="flex h-12 items-center px-4 justify-between shadow-md">
            <Link href="/">
              <a className="text-lg font-bold">amazona</a>
            </Link>
            <div>
              <Link href="/cart">
                <a className="p-2">
                  Cart
                  {cartItemsCount > 0 && (
                    <span className="ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </a>
              </Link>
              {/* Si le statut est 'loading', on affiche 'loading' */}
              {status === 'loading' ? (
                'Loading'
              ) : /* Sinon, si la session est ouverte, on affiche le nom de l'utilisateur avec le user menu */
              session?.user ? (
                <Menu as="div" className="relative inline-block">
                  <Menu.Button className="text-blue-600">
                    {session.user.name}
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white shadow-lg">
                    <Menu.Item>
                      <DropdownLink className="dropdown-link" href="/profile">
                        Profile
                      </DropdownLink>
                    </Menu.Item>

                    <Menu.Item>
                      <DropdownLink
                        className="dropdown-link"
                        href="/order-history"
                      >
                        Order History
                      </DropdownLink>
                    </Menu.Item>

                    <Menu.Item>
                      <a
                        href="#"
                        className="dropdown-link"
                        onClick={logoutClickHandler}
                      >
                        Logout
                      </a>
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              ) : (
                /* Sinon, si la session n'est pas ouverte, on affiche "Login" */
                <Link href="/login">
                  <a className="p-2">Login</a>
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="flex h-10 justify-center items-center shadow-inner">
          Copyright © 2022 Amazona
        </footer>
      </div>
    </>
  );
}
