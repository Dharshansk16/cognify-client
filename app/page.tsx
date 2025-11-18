"use client";

import { useState, useEffect } from "react";
import AuthForm from "@/components/auth-form";
import Dashboard from "@/components/dashboard";
import { getToken } from "@/lib/api";
import { isTokenExpired } from "@/lib/auth";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      console.log("Found existing token, user is authenticated");
      setIsAuthenticated(true);
    } else if (token && isTokenExpired(token)) {
      console.log("Token expired, clearing authentication");
      localStorage.clear();
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-accent/30 border-t-accent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {!isAuthenticated ? (
        <AuthForm onSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      )}
    </main>
  );
}
