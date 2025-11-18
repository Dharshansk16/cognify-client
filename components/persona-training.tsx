"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle, FileText, Trash2, BarChart3 } from "lucide-react";
import { personaAPI, uploadAPI, getUserId } from "@/lib/api";
import type { Persona } from "@/lib/types";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export default function PersonaTraining() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPersonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPersonas = async () => {
    try {
      console.log("Loading personas for training...");
      const data = await personaAPI.list();
      console.log("Personas loaded for training:", data);
      setPersonas(data);
      if (data.length > 0 && !selectedPersona) {
        setSelectedPersona(data[0].id || "");
      }
    } catch (err) {
      console.error("Failed to load personas:", err);
      let errorMessage = "Failed to load personas";
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const processFile = async (file: File, fileId: string) => {
    if (!selectedPersona) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error" as const, error: "No persona selected" }
            : f
        )
      );
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
                error: "User not authenticated",
              }
            : f
        )
      );
      return;
    }

    try {
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress < 90) {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
          );
        }
      }, 300);

      console.log("Uploading file:", {
        fileName: file.name,
        userId,
        personaId: selectedPersona,
      });
      await uploadAPI.upload(file, userId, selectedPersona);
      console.log("File uploaded successfully:", file.name);

      clearInterval(progressInterval);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, progress: 100, status: "completed" as const }
            : f
        )
      );
    } catch (err) {
      console.error("File upload failed:", err);
      let errorMessage = "Upload failed";
      if (err instanceof Error) {
        if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("Network")
        ) {
          errorMessage =
            "Cannot connect to server. Please ensure the backend is running.";
        } else if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          errorMessage = err.message;
        }
      }
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
                error: errorMessage,
              }
            : f
        )
      );
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setError(null);

    if (!selectedPersona) {
      setError("Please select a persona first");
      return;
    }

    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files);

      // Validate file types
      const pdfFiles = fileList.filter(
        (file) => file.type === "application/pdf"
      );

      if (pdfFiles.length === 0) {
        setError("Please upload PDF files only");
        return;
      }

      // Validate file sizes (50MB limit)
      const oversizedFiles = pdfFiles.filter(
        (file) => file.size > 50 * 1024 * 1024
      );

      if (oversizedFiles.length > 0) {
        setError(
          `Some files exceed 50MB limit: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      const newFiles: UploadedFile[] = pdfFiles.map((file, idx) => ({
        id: `file-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Process each file
      pdfFiles.forEach((file, idx) => {
        processFile(file, newFiles[idx].id);
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const fileList = Array.from(e.target.files);

    // Validate file types
    const pdfFiles = fileList.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      setError("Please upload PDF files only");
      return;
    }

    // Validate file sizes (50MB limit)
    const oversizedFiles = pdfFiles.filter(
      (file) => file.size > 50 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setError(
        `Some files exceed 50MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    const newFiles: UploadedFile[] = pdfFiles.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    pdfFiles.forEach((file, idx) => {
      processFile(file, newFiles[idx].id);
    });

    // Reset file input
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white text-balance">
          Train Your Persona
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload PDFs and documents to teach your AI persona about specific
          topics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Persona Selector */}
          <div className="glassmorphic p-4">
            <label className="text-sm font-semibold text-white mb-2 block">
              Select Persona to Train
            </label>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
            >
              {personas.length === 0 ? (
                <option value="">
                  No personas available - create one first
                </option>
              ) : (
                personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`glassmorphic p-12 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer block ${
              dragActive
                ? "border-accent bg-accent/10"
                : "border-white/20 hover:border-accent/50"
            }`}
          >
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
              disabled={!selectedPersona}
            />
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {selectedPersona
                    ? "Drag and drop your PDFs"
                    : "Select a persona first"}
                </p>
                <p className="text-muted-foreground">
                  {selectedPersona
                    ? "or click to browse"
                    : "to start uploading training materials"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: PDF files up to 50MB
              </p>
            </div>
          </label>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Uploaded Files</h3>
              {files.map((file) => (
                <div key={file.id} className="glassmorphic p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-purple-600 to-blue-600 transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                  </div>

                  {file.status === "completed" && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Processing complete</span>
                    </div>
                  )}

                  {file.status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <span>Error: {file.error || "Upload failed"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Persona Info */}
        <div className="space-y-4">
          <div className="glassmorphic p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Training Status</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your persona is ready for training. Upload documents to improve
                knowledge.
              </p>
            </div>
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents</span>
                <span className="text-white font-semibold">{files.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="text-white font-semibold">
                  {files.filter((f) => f.status === "completed").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selected Persona</span>
                <span className="text-white font-semibold truncate ml-2">
                  {personas.find((p) => p.id === selectedPersona)?.name ||
                    "None"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
