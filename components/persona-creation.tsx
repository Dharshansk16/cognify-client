"use client";

import { useState, useEffect } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { personaAPI } from "@/lib/api";
import type { Persona } from "@/lib/types";

export default function PersonaCreation() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load existing personas
  useEffect(() => {
    loadPersonas();
  }, []);

  // Auto-dismiss success and error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadPersonas = async () => {
    setLoadingPersonas(true);
    try {
      console.log("Loading personas...");
      const data = await personaAPI.list();
      console.log("Personas loaded:", data);
      setPersonas(data);
    } catch (err) {
      console.error("Failed to load personas:", err);
      if (err instanceof Error && err.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Please ensure the backend is running."
        );
      }
    } finally {
      setLoadingPersonas(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (formData.name.trim().length < 2) {
      setError("Persona name must be at least 2 characters");
      setLoading(false);
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("Creating persona...");
      const newPersona: Persona = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await personaAPI.create(newPersona);
      console.log("Persona created successfully");
      setSuccess("Persona created successfully!");
      setFormData({ name: "", description: "" });

      // Reload personas
      await loadPersonas();
    } catch (err) {
      console.error("Failed to create persona:", err);
      let errorMessage = "Failed to create persona";
      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("Network")
        ) {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this persona?")) {
      return;
    }

    try {
      console.log("Deleting persona:", id);
      await personaAPI.delete(id);
      console.log("Persona deleted successfully");
      setSuccess("Persona deleted successfully!");
      await loadPersonas();
    } catch (err) {
      console.error("Failed to delete persona:", err);
      let errorMessage = "Failed to delete persona";
      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("Network")
        ) {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white text-balance">
          Craft Your AI Persona{" "}
          <Sparkles className="inline w-8 h-8 text-accent" />
        </h1>
        <p className="text-muted-foreground text-lg">
          Create a unique AI persona with custom behavior, knowledge, and
          communication style
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glassmorphic p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Persona Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Creative AI Assistant"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your persona's role, expertise, and personality..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create Persona</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar - My Personas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">My Personas</h3>
          {loadingPersonas ? (
            <div className="glassmorphic p-8 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : personas.length === 0 ? (
            <div className="glassmorphic p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No personas yet. Create your first one!
              </p>
            </div>
          ) : (
            personas.map((persona) => (
              <div
                key={persona.id}
                className="glassmorphic p-4 group hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-accent transition-colors truncate">
                      {persona.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {persona.description}
                    </p>
                  </div>
                  <button
                    onClick={() => persona.id && handleDelete(persona.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
