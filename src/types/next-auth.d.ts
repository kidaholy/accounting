import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    tenantId?: string;
    tenantName?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: string;
      tenantId?: string;
      tenantName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    tenantId?: string;
    tenantName?: string;
  }
}
