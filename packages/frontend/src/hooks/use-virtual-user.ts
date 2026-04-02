import { useState, useEffect, useCallback } from "react";
import { getFingerprint, resetFingerprint } from "@/lib/fingerprint";

const SESSION_KEY = "vivim_session";
const USER_ID_KEY = "vivim_user_id";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

interface SessionData {
  sessionToken: string;
  virtualUserId: string;
  expiresAt: number;
}

interface VirtualUserRegistration {
  virtualUserId: string;
  sessionToken: string;
  isNewUser: boolean;
}

export function useVirtualUser() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  const registerUser = useCallback(async (fingerprint: string): Promise<VirtualUserRegistration | null> => {
    try {
      const response = await fetch("/api/v1/virtual/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fingerprint,
          existingSessionToken: session?.sessionToken,
        }),
      });

      if (!response.ok) {
        console.warn("User registration failed:", response.status);
        return null;
      }

      const data = await response.json();
      return {
        virtualUserId: data.virtualUserId,
        sessionToken: data.sessionToken,
        isNewUser: data.isNewUser,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  }, [session?.sessionToken]);

  const initializeUser = useCallback(async () => {
    setIsLoading(true);

    const fp = getFingerprint();
    setUserId(fp);

    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const sessionData: SessionData = JSON.parse(storedSession);
        if (sessionData.expiresAt > Date.now()) {
          setSession(sessionData);
          setIsRegistered(true);
          setIsLoading(false);
          return;
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {}

    const result = await registerUser(fp);
    if (result) {
      const sessionData: SessionData = {
        sessionToken: result.sessionToken,
        virtualUserId: result.virtualUserId,
        expiresAt: Date.now() + SESSION_DURATION,
      };
      setSession(sessionData);
      setIsRegistered(true);

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        localStorage.setItem(USER_ID_KEY, result.virtualUserId);
      } catch {}
    }

    setIsLoading(false);
  }, [registerUser]);

  const refreshSession = useCallback(async () => {
    if (!session?.sessionToken) return false;

    try {
      const response = await fetch("/api/v1/virtual/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
        }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const newSession: SessionData = {
        sessionToken: data.sessionToken,
        virtualUserId: data.virtualUserId,
        expiresAt: Date.now() + SESSION_DURATION,
      };

      setSession(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return true;
    } catch {
      return false;
    }
  }, [session?.sessionToken]);

  const logout = useCallback(() => {
    setSession(null);
    setIsRegistered(false);
    resetFingerprint();

    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USER_ID_KEY);
    } catch {}
  }, []);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return {
    userId,
    session,
    isLoading,
    isRegistered,
    refreshSession,
    logout,
  };
}
