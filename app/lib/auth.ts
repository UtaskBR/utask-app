
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { normalizeEmail } from "@/utils/formatters";

// Custom error for email not verified
export class EmailNotVerifiedError extends Error {
  constructor(message = "EMAIL_NOT_VERIFIED") {
    super(message);
    this.name = "EmailNotVerifiedError";
  }
}

import { Role } from "@prisma/client"; // Import Role enum

// Extend the Session and JWT types to include id and role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role; // Add role to session user
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: Role; // Add role to JWT token
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }
        
        const normalizedEmail = normalizeEmail(credentials.email);
        if (!normalizedEmail) {
          throw new Error("Email inválido");
        }
        
        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail // Use normalized email for lookup
          }
        });

        if (!user || !user.password) {
          // Standard error message for security (don't reveal if user exists or password is wrong)
          throw new Error("Usuário ou senha inválidos");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Usuário ou senha inválidos");
        }

        // Check if email is verified
        if (!user.emailIsVerified) {
          throw new EmailNotVerifiedError(); // Use custom error
        }

        // Return user object including id and role
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Include role from the user model
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // If user object exists (on sign in), persist id and role to the token
      if (user) {
        token.id = user.id;
        token.role = user.role as Role; // Cast user.role to Role
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer id and role from token to session user object
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Garante que o redirecionamento funcione para URLs relativas e absolutas
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith("/")) {
        return new URL(url, baseUrl).toString();
      }
      // Redireciona para a página inicial por padrão se a URL for inválida
      return baseUrl;
    },
  },
};
