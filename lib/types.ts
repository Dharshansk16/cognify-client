// Backend API Types matching Java DTOs

export interface AuthRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId?: string;
  email?: string;
  name?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Persona {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatRequest {
  personaId: string;
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  userMessage: string;
  personaResponse: string;
  personaName: string;
  sourcesUsed: number;
}

export interface ConversationResponse {
  id: string;
  personaId: string;
  personaName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  url: string;
  status: string;
  message: string;
}
