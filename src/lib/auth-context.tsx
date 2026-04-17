"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  /** Vrai abonné payant (Stripe, futur) */
  isSubscribed: boolean;
  /** Bêta testeur activé via mot de passe */
  isBetaTester: boolean;
  /** Accès premium = isSubscribed OU isBetaTester */
  hasPremiumAccess: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isSubscribed: false,
  isBetaTester: false,
  hasPremiumAccess: false,
  signInWithMagicLink: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signInWithPassword: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBetaTester, setIsBetaTester] = useState(false);

  const checkAdmin = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, is_subscribed, is_beta_tester")
      .eq("id", userId)
      .single();
    setIsAdmin(data?.is_admin ?? false);
    setIsSubscribed(data?.is_subscribed ?? false);
    setIsBetaTester(data?.is_beta_tester ?? false);
  }, []);

  // Accès premium = abonné payant OU bêta testeur
  const hasPremiumAccess = isSubscribed || isBetaTester;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) checkAdmin(s.user.id);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh, password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        checkAdmin(s.user.id);
      } else {
        setIsAdmin(false);
        setIsSubscribed(false);
        setIsBetaTester(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  // ── Magic Link (existant) ──
  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    return { error: error?.message ?? null };
  }

  // ── Inscription email + mot de passe ──
  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      return { error: mapAuthError(error.message), needsConfirmation: false };
    }

    // Supabase renvoie un user sans session si la confirmation email est activée
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }

  // ── Connexion email + mot de passe ──
  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }
    return { error: null };
  }

  // ── Réinitialisation du mot de passe ──
  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app/reset-password`,
    });
    return { error: error?.message ?? null };
  }

  // ── Mise à jour du mot de passe (après clic sur le lien reset) ──
  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error?.message ?? null };
  }

  // ── Déconnexion ──
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsSubscribed(false);
    setIsBetaTester(false);
  }

  async function refreshProfile() {
    if (user) await checkAdmin(user.id);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isSubscribed,
        isBetaTester,
        hasPremiumAccess,
        signInWithMagicLink,
        signUp,
        signInWithPassword,
        resetPassword,
        updatePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ── Traduction des erreurs Supabase Auth ──
function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (lower.includes("email not confirmed")) {
    return "Ton email n'a pas encore été confirmé. Vérifie ta boîte de réception.";
  }
  if (lower.includes("user already registered")) {
    return "Un compte existe déjà avec cet email. Essaie de te connecter.";
  }
  if (lower.includes("password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (lower.includes("email rate limit exceeded") || lower.includes("rate limit")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (lower.includes("signups not allowed")) {
    return "Les inscriptions sont temporairement désactivées.";
  }
  return message;
}
