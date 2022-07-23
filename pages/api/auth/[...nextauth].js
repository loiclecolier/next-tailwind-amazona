// npm install next-auth
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
// npm install bcryptjs
import bcryptjs from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';

/* Authentification basée sur la base de données de MongoDB (pas de Google, Github ou autre) */

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Si user existe, on lui remplit un token avec son ID
      if (user?._id) token._id = user._id;
      // pareil pour isAdmin
      if (user?.isAdmin) token.isAdmin = user.isAdmin;
      return token;
    },
    async session({ session, token }) {
      if (token?._id) session.user._id = token._id;
      if (token?.isAdmin) session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      // check si l'utilisateur est autorisé à se connecter
      async authorize(credentials) {
        await db.connect();
        // recherche de l'utilisateur avec le mail
        const user = await User.findOne({
          email: credentials.email,
        });
        await db.disconnect();
        // si l'utilisateur existe et que le password entré correspond à celui de la db
        if (user && bcryptjs.compareSync(credentials.password, user.password)) {
          // on retourne l'utilisateur
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: 'f',
            isAdmin: user.isAdmin,
          };
        }
        // si incorrect
        throw new Error('Invalid email or password');
      },
    }),
  ],
});
