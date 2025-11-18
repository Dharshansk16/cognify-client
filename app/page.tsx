'use client';

import { useState } from 'react';
import AuthForm from '@/components/auth-form';
import Dashboard from '@/components/dashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
