import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
// npm install react-hook-form
import { useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getError } from '../utils/error';
// npm i react-toastify
import { toast } from 'react-toastify';

export default function LoginScreen() {
  // récupère la data (renommée en session) du hook useSession de NextAuth
  const { data: session } = useSession();

  const router = useRouter();
  const { redirect } = router.query;

  useEffect(() => {
    // si une session d'utilisateur est ouverte
    if (session?.user) {
      // pas besoin de login => redirection
      router.push(redirect || '/');
    }
  }, [router, session, redirect]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({ email, password }) => {
    try {
      // on utilise la fonction signIn de la librairie NextAuth
      // credentials = moyen de connexion où on utilise des informations stockés dans MongoDB (on aurait pu utiliser Google par exemple)
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      // en cas d'erreur lors de la connexion
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Login">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Login</h1>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
            id="email"
            className="w-full"
            autoFocus
          />
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Please enter password',
              minLength: { value: 6, message: 'password is more than 5 chars' },
            })}
            id="password"
            className="w-full"
            autoFocus
          />
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>
        <div className="mb-4">
          <button className="primary-button">Login</button>
        </div>
        <div className="mb-4">
          Don&apos;t have an account? &nbsp;
          <Link href="register">Register</Link>
        </div>
      </form>
    </Layout>
  );
}
