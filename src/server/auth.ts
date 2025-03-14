import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad"; // Importa el proveedor de Microsoft

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account) {

        if (account.provider === "azure-ad") {
          const email = profile?.preferred_username.toLowerCase();
         
          if (!email) {
            console.error("El usuario no tiene un email válido.");
            return token; // Retorna el token existente
          }
          //da de alta el usuario en la base de datos
          try {
            const res = await fetch(process.env.API_SALARY + "/users/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            console.log('Response Back', res)

            if (!res.ok) {
              console.error("Error al registrar el usuario en el backend:", await res.text());
            }
          } catch (error) {
            console.error("Error registrando el usuario en el backend:", error);
          }

          token.accessToken = account.access_token;
          token.id = account.id_token; // Si necesitas el ID token
          token.user = { email }; // Asegúrate de usar un objeto válido
        }

        if (account.provider === "credentials") {
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
          id: token.user?.id,
          roles: token.user?.roles,
          token: token.accessToken, // Token de Credentials (si existe)
          email: token.user?.email
        };
      }

      // Llamar al backend para obtener roles y datos adicionales
      if (session.user?.email) {
        try {
          const response = await fetch(process.env.API_SALARY + "/users/get_roles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${session.accessToken}`, // Token del usuario
            },
            body: JSON.stringify({ email: session.user.email }),
          });
         
          const data = await response.json();
          console.log('vuelve a llamar: ',data)

          if (response.ok && data) {
            // Agregar roles del backend a la sesión
            session.user.roles = data;
          } else {
            console.error("Error backend:", data);
          }

          // http://localhost:8000/api/v1/users/find_by_email
          // buscar ID del usuario
          const responseUser = await fetch(process.env.API_SALARY + "/users/find_by_email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${session.accessToken}`, // Token del usuario
            },
            body: JSON.stringify({ email: session.user.email }),
          });

          const dataUser = await responseUser.json();
          console.log('dataUser', dataUser)
          if (responseUser.ok && dataUser) {
            // Agregar roles del backend a la sesión
            session.user.id = dataUser.id;
          } else {
            console.error("Error backend:", dataUser);
          }

        } catch (error) {
          console.error("Error backend:", error);
        }
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
          console.log('data: ', data)
          

          if (res.ok && data) {

            const user = {
              token: data.access_token,
              name: data.user_data.user_name,
              id: data.user_data.id,
              email: data.user_data.email,
              roles: data.user_roles
            }
            return user;
          } else {
            throw new Error('Invalid User');
          }
        } catch (error) {
          throw new Error('Autentication error');
        }
      }
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email",
          // // Esta URI debe coincidir con la registrada en Azure Portal
          // redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/azure-ad`,
          redirect_uri: `${process.env.AZURE_AD_REDIRECT_URI}`,
        },
      },

    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); //(6)
