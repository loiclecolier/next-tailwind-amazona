import '../styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { StoreProvider } from '../utils/Store';
import { useRouter } from 'next/router';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // on wrappe toute l'application avec le session provider (gestion session utilisateur)
    <SessionProvider session={session}>
      {/* on wrappe toute l'application avec le store (gestion d'état) */}
      <StoreProvider>
        {/* Permet d'utiliser PayPal dans l'app */}
        <PayPalScriptProvider deferLoading={true}>
          {/* Vérifie si la page (Component) a la propriété 'auth' sur true */}
          {Component.auth ? (
            // Si oui on wrappe la page pour rediriger l'utilisateur s'il n'est pas connecté
            <Auth>
              <Component {...pageProps} />
            </Auth>
          ) : (
            // Si non, on affiche simplement la page
            <Component {...pageProps} />
          )}
        </PayPalScriptProvider>
      </StoreProvider>
    </SessionProvider>
  );
}

// Fonction pour ne permettre qu'aux utilisateurs connectés d'accéder à certaines pages
function Auth({ children }) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    // si pas connecté, redirection vers la page "unauthorized"
    onUnauthenticated() {
      router.push('/unauthorized?message=login required');
    },
  });
  // Si le statut est en chargement, on renvoie une simple div avant de charger la page (soit la page protégée, soit la page unauthorized)
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  // Sinon, on renvoie le contenu de la page
  return children;
}

export default MyApp;
