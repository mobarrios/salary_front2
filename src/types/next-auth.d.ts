import NextAuth, { User, type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      token: string;
      name: string;
      roles: [];
    };
  }
  interface User {
    id: string;
    token: string;
    name: string;
    roles: [];
  
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      token: string;
      name: string;
      roles: [];
    };
  }
}