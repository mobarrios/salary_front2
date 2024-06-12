import {
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", //(1) the default is jwt when no adapter defined, we redefined here to make it obvious what strategy that we use 
    maxAge: 60 * 30,
  },

  callbacks: {

    async jwt({ token, user, account }) { //(2) 
      //console.log("------------ TOKEN ------------");
      //console.log({ token }, { user });

      user && (token.user = user);
      return token;
    },
    async session({ session, token, user }) { //(3)

      //console.log("------------ SESSION ------------");
      if (token) {
        session.user.token = token.user.token
      }
      //console.log({ session });
      return session;
    },

  },
  pages: {
    error: '/auth/signin'
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: {},
        password: {}
      },
      async authorize(credentials) {

        const { username, password } = credentials as {
          username: string
          password: string
        };


        //172.31.98.115
        //192.168.0.201
        //process.env.API_URL

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
          const res = await fetch("http://127.0.0.1:8000/api/v1/token", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log('User login', data)
          if (res.ok && data) {

            const user = {
              token: data.access_token
            }

            return user;
          } else {
            throw new Error('Usuario Invalido');
          }
        } catch (error) {
          throw new Error('Error al autenticar');
        }


      }
    })
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); //(6)