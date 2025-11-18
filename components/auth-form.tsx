"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { authAPI, setToken, setUserId, setUserEmail } from "@/lib/api";
import type { AuthRequest, SignupRequest } from "@/lib/types";

interface AuthFormProps {
  onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const loginData: AuthRequest = { email, password };
        const response = await authAPI.login(loginData);
        setToken(response.token);
        if (response.userId) setUserId(response.userId);
        if (response.email) setUserEmail(response.email);
        onSuccess();
      } else {
        const signupData: SignupRequest = { name, email, password };
        const response = await authAPI.signup(signupData);
        setToken(response.token);
        if (response.userId) setUserId(response.userId);
        if (response.email) setUserEmail(response.email);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Brand Section */}
          <div className="hidden md:flex flex-col justify-center space-y-8 animate-fade-in">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 text-balance">
                Persona AI
              </h1>
              <p className="text-lg text-muted-foreground">
                Craft intelligent AI personas and unlock deeper insights
              </p>
            </div>

            <div className="space-y-6">
              {[
                "Create Custom Personas",
                "Train with Your Data",
                "Chat Naturally",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                    <span className="text-white font-bold text-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{feature}</p>
                    <p className="text-sm text-muted-foreground">
                      Premium AI experience
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Form Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="glassmorphic p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white text-balance">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isLogin
                    ? "Sign in to your Persona AI account"
                    : "Join the future of AI collaboration"}
                </p>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-all duration-300 group">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="currentColor"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                  Continue with Google
                </span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-b from-[oklch(0.12_0.02_280)] to-[oklch(0.12_0.02_280)] text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-accent transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setError(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <span className="font-semibold text-accent">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
