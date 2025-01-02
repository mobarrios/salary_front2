import {
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad"; // Importa el proveedor de Microsoft

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", 
    maxAge: 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // user && (token.user = user);
      // return token;
      if (account) {
      // Si el usuario se autentica con Azure
          if (account.provider === "azure-ad") {
            console.log("account", account);
            token.accessToken = account.access_token;
            token.id = account.id_token; // Si necesitas el ID token
          }

      // Si el usuario se autentica con Credentials
          if (user) {
            token.user = user;
            token.accessToken = user.token;
          }
    }

    return token;

    },
    async session({ session, token, user }) {

      if (token) {
            session.accessToken = token.accessToken; // Token de Azure o Credentials
            session.user = {
                ...session.user,
                id: token.user?.id ,
                roles: token.user?.roles ,
                token: token.user?.token , // Token de Credentials (si existe)
      };

    }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirige al home después de un inicio de sesión exitoso
      return `${baseUrl}/`;
    },

  },
  pages: {
    signIn: '/auth/signin', 
    error: '/auth/signin'
  },
  providers: [
    CredentialsProvider({
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
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          // // Esta URI debe coincidir con la registrada en Azure Portal
          // redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/azure-ad`,
        redirect_uri: `${process.env.AZURE_AD_REDIRECT_URI}`,
        
        },
      },

    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); //(6)
