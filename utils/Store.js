import { createContext, useReducer } from 'react';
// npm install js-cookie
import Cookies from 'js-cookie';

export const Store = createContext();

const initialState = {
  // cart: { cartItems: [] }, => sans cookie

  // Avec cookie
  cart: Cookies.get('cart')
    ? // Si les cookies existent, l'état initial est les cookies convertis en objet JS
      JSON.parse(Cookies.get('cart'))
    : // Sinon, l'état initial est un tableau vide
      { cartItems: [], shippingAddress: {} },
};

function reducer(state, action) {
  switch (action.type) {
    // Ajout d'un item dans le panier
    case 'CART_ADD_ITEM': {
      // Récupère le nouvel item
      const newItem = action.payload;
      // Récupère l'item s'il est déjà existant dans le panier
      const existItem = state.cart.cartItems.find(
        (item) => item.slug === newItem.slug
      );
      // Récupère l'ensemble des items du panier
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.name === existItem.name ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      // Mise à jour des cookies pour sauvegarder le panier avec le nouvel état
      // stringify car on ne peut pas sauvegarder d'objets JS dans les cookies
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
      // Retourne le nouvel état du panier
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    // Suppression d'un article du panier
    case 'CART_REMOVE_ITEM': {
      // Filtre les items du panier pour supprimer celui dont le slug a été envoyé
      const cartItems = state.cart.cartItems.filter(
        (item) => item.slug !== action.payload.slug
      );
      // Mise à jour des cookies pour sauvegarder le panier avec le nouvel état
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
      // Retourne le nouvel état du panier
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    // Reset du panier
    case 'CART_RESET':
      return {
        ...state,
        cart: {
          cartItems: [],
          shippingAddress: { location: {} },
          paymentMethod: '',
        },
      };

    // Nettoyage des produits du panier (permet de sauvegarder le reste dans les cookies après un achat)
    case 'CART_CLEAR_ITEMS': {
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    }

    // Sauvegarde de l'adresse de livraison
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        // On ajoute l'adresse de livraison à l'objet cart avec les anciens états
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            ...action.payload,
          },
        },
      };

    // Sauvegarde de la méthode de paiement
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: {
          ...state.cart,
          paymentMethod: action.payload,
        },
      };

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  // Pour wrapper l'ensemble de l'application avec le store
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
