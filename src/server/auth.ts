import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad"; // Importa el proveedor de Microsoft

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", 
    maxAge: 60 * 60,
  },

  callbacks: {

    // async signIn({ account, profile, user }) {

    //   if (account?.provider === "azure-ad") {
    //     // Obtener el email desde el perfil de Azure
    //     const email = profile?.email;
    //     if (!email) {
    //       console.error("El usuario no tiene un email válido.");
    //       return false;
    //     }

    //     // Registrar el usuario en el backend si no existe
    //     try {    
    //       const res = await fetch( process.env.API_SALARY +"/users/register",{
    //         method: "POST",
    //         headers: { "Content-Type": "application/json"},
    //         body: JSON.stringify({ email : email }),
    //       });

    //       return res; 

    //     } catch (error) {
    //       console.error("Error registrando el usuario en el backend:", error);
    //       return false;
    //     }
    //   }
    // },


    // async jwt({ token, user, account , profile}) {
    //   console.log('profile'+profile)
    //   // user && (token.user = user);
    //   // return token;
    //   if (account) {
    //     // console.log("account", account);
    //   // Si el usuario se autentica con Azure
    //       if (account.provider === "azure-ad") {
    //             // Obtener el email desde el perfil de Azure
    //             const email = profile?.email;
                
    //             if (!email) {
    //                 console.error("El usuario no tiene un email válido.");
    //                 return false;
    //             }
    //               // Registrar el usuario en el backend si no existe
    //               try {    
    //                 const res = await fetch( process.env.API_SALARY +"/users/register",{
    //                   method: "POST",
    //                   headers: { "Content-Type": "application/json"},
    //                   body: JSON.stringify({ email : email }),
    //               });

    //               } catch (error) {
    //                 console.error("Error registrando el usuario en el backend:", error);
    //                 return false;
    //             }
  
    //         token.accessToken = account.access_token;
    //         token.id = account.id_token; // Si necesitas el ID token  
    //         token.user = profile;
    //       }

    //       if (account.provider === "credentials") {
    //             token.user = user;
    //             token.accessToken = user.token;
    //       } 
    //   }

    //   // Si el usuario se autentica con Credentials
    //   // if (user) {
    //   //   console.log("user", user);
    //   //   token.user = user;
    //   //   token.accessToken = user.token;
    //   // }

    // return token;

    // },

    async jwt({ token, user, account, profile }) {
      console.log("JWT Callback:");
      console.log("Token:", token);
      console.log("Account:", account);
      console.log("Profile:", profile);
      if (account) {
       
          if (account.provider === "azure-ad") 
          {
              const email = profile?.email;
          
              if(email == null ){
                const email = profile?.preferred_username;
              }
              
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

      // return {
      //   ...token,
      //   user: token.user || {},
      //   accessToken: token.accessToken || null,
      //   id: token.id || null,
      // };
      return token;
    },

    async session({ session, token, user }) {
    
      console.log("Session Callback:");
      console.log("Session:", session);
      console.log("Token:", token);
    if (token) {
      session.accessToken = token.accessToken; // Token de Azure o Credentials
      session.user = {
          ...session.user,
          id: token.user?.id ,
          roles: token.user?.roles ,
          token: token.accessToken , // Token de Credentials (si existe)
      };
      } 

    // console.log("session", session);

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

        if (response.ok && data) {
          // Agregar roles del backend a la sesión
          session.user.roles = data;
        } else {
          console.error("Error backend:", data);
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
          
          if (res.ok && data) {
            const user = {
              token: data.access_token,
              name: data.user_data.user_name,
              id: data.user_data.id,
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
          scope: "openid profile email" ,
          // // Esta URI debe coincidir con la registrada en Azure Portal
          // redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/azure-ad`,
        redirect_uri: `${process.env.AZURE_AD_REDIRECT_URI}`,
        },
      },

    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); //(6)
