import {
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", //(1) the default is jwt when no adapter defined, we redefined here to make it obvious what strategy that we use 
    maxAge: 60 * 60,
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
        session.user.token = token.user.token;
        session.user.id = token.user.id;
        session.user.roles = token.user.roles; // Asegúrate de incluir roles        
      }
      //console.log({ session });
      return session;
    },

  },
  pages: {
    error: '/auth/signin'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
          const res = await fetch(process.env.API_SALARY + "/token", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          
          if (res.ok && data) {
            const user = {
              token: data.access_token,
              name: data.user_data.user_name,
              id: data.user_data.id,
              roles: data.user_roles
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
