import {
  AuthRequest,
  AuthResponse,
  SignupRequest,
  Persona,
  ChatRequest,
  ChatResponse,
  ConversationResponse,
  UploadResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Token and User management
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
};

export const getUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
};

export const setUserId = (userId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("userId", userId);
};

export const getUserEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
};

export const setUserEmail = (email: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("userEmail", email);
};

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth APIs
export const authAPI = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: AuthRequest): Promise<AuthResponse> => {
    return apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Persona APIs
export const personaAPI = {
  list: async (): Promise<Persona[]> => {
    return apiCall<Persona[]>("/api/personas", {
      method: "GET",
    });
  },

  get: async (id: string): Promise<Persona> => {
    return apiCall<Persona>(`/api/personas/${id}`, {
      method: "GET",
    });
  },

  create: async (persona: Persona): Promise<Persona> => {
    return apiCall<Persona>("/api/personas", {
      method: "POST",
      body: JSON.stringify(persona),
    });
  },

  update: async (id: string, persona: Partial<Persona>): Promise<Persona> => {
    return apiCall<Persona>(`/api/personas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(persona),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/api/personas/${id}`, {
      method: "DELETE",
    });
  },
};

// Conversation/Chat APIs
export const conversationAPI = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    return apiCall<ChatResponse>("/api/conversations/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list: async (): Promise<ConversationResponse[]> => {
    return apiCall<ConversationResponse[]>("/api/conversations", {
      method: "GET",
    });
  },

  get: async (conversationId: string): Promise<ConversationResponse> => {
    return apiCall<ConversationResponse>(
      `/api/conversations/${conversationId}`,
      {
        method: "GET",
      }
    );
  },

  delete: async (conversationId: string): Promise<void> => {
    return apiCall<void>(`/api/conversations/${conversationId}`, {
      method: "DELETE",
    });
  },
};

// Upload APIs
export const uploadAPI = {
  upload: async (
    file: File,
    userId: string,
    personaId: string
  ): Promise<UploadResponse> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("personaId", personaId);

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  list: async (personaId?: string): Promise<UploadResponse[]> => {
    const endpoint = personaId
      ? `/api/uploads?personaId=${personaId}`
      : "/api/uploads";
    return apiCall<UploadResponse[]>(endpoint, {
      method: "GET",
    });
  },
};
