import axios from 'axios';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import db from '../utils/db';
import Product from '../models/Product';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import { toast } from 'react-toastify';

// on récupère les produits de la fonction getServerSideProps dans les props
export default function Home({ products }) {
  const { state, dispatch } = useContext(Store);
  // on récupère le panier actuel
  const { cart } = state;

  // Ajouter un produit au panier
  const addToCartHandler = async (product) => {
    // Recherche si l'item est déjà dans le panier
    const existItem = cart.cartItems.find((x) => x.slug === product.slug);
    // S'il est déjà dans le panier, on incrémente la quantité de l'item existant 1, sinon on renvoie juste 1
    const quantity = existItem ? existItem.quantity + 1 : 1;

    // Pour s'assurer qu'on a la quantité suffisante niveau backend
    // on récupère le produit grâce à une requête Ajax avec axios
    const { data } = await axios.get(`/api/products/${product._id}`);
    // Vérifie si la quantité n'est pas plus grande que le nombre de produits en stock
    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    // Dispatch l'action avec le produit et la quantité
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };

  return (
    <Layout title="Home Page">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem
            product={product}
            key={product.slug}
            addToCartHandler={addToCartHandler}
          ></ProductItem>
        ))}
      </div>
    </Layout>
  );
}

// Fonction spéciale de Next.js
// Next.js va "pre-render" la page à chaque requête utilisant les données retournées par getServerSideProps(), et ainsi fournir les données de la base de données aux composants
export async function getServerSideProps() {
  await db.connect();
  // récupère tous les produits de la base de données
  // lean() permet de récupérer les infos des produits à la place des méta-données de Mongoose => plus rapide
  const products = await Product.find().lean();
  // retourne les produits (products) dans un objet props (propriétés)
  return {
    props: {
      // on map sur chaque produit pour avoir chaque produit converti en objet JS
      products: products.map(db.convertDocToObj),
    },
  };
}
