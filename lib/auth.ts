import { getToken } from "./api";

interface DecodedToken {
  sub: string; // email
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const getCurrentUserEmail = (): string | null => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.sub || null;
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  return decoded.exp * 1000 < Date.now();
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  return !isTokenExpired(token);
};
