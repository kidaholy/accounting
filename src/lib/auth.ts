import NextAuth from "next-auth";
import type { NextAuthConfig, User as NextAuthUser, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import { User } from "./models";

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();
        
        const user = await User.findOne({ email: credentials.email as string }).populate('tenant');
        
        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password as string);
        
        if (!isPasswordValid) {
          return null;
        }

        // Check if tenant subscription is active
        if (user.tenant && user.tenant.subscriptionStatus !== 'active') {
          throw new Error('Subscription expired. Please contact your administrator.');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenant?._id?.toString() || null,
          tenantName: user.tenant?.name || null,
        } as NextAuthUser;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: NextAuthUser }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: Record<string, unknown> }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantName = token.tenantName as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  'super_admin': 4,
  'tenant_admin': 3,
  'accountant': 2,
  'viewer': 1,
};

export function hasRole(userRole: string, requiredRole: string): boolean {
  return ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY];
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxUsers: 1,
    maxAssets: 10,
    maxInventoryItems: 50,
    features: ['Basic VAT calculation', 'Limited assets', 'Limited inventory']
  },
  basic: {
    name: 'Basic',
    price: 29,
    maxUsers: 3,
    maxAssets: 100,
    maxInventoryItems: 500,
    features: ['Full VAT declaration', 'Asset management', 'Inventory tracking', 'Email support']
  },
  professional: {
    name: 'Professional',
    price: 79,
    maxUsers: 10,
    maxAssets: 1000,
    maxInventoryItems: 5000,
    features: ['Everything in Basic', 'Multi-user access', 'Advanced reports', 'Priority support', 'Data export']
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    maxUsers: 100,
    maxAssets: 10000,
    maxInventoryItems: 50000,
    features: ['Everything in Professional', 'Unlimited users', 'Custom integrations', 'Dedicated support', 'SLA guarantee']
  }
};

// Create the auth handler for Next.js v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
