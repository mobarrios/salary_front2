import NextAuth, { User, type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      token: string;
      name: string;
      roles: [];
    };
  }
  interface User {
    id: number;
    token: string;
    name: string;
    roles: [];
  
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: number;
      token: string;
      name: string;
      roles: [];
    };
  }
}