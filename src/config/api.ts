/**
 * Endereço-base da API.
 *
 * Desenvolvimento:
 *   http://localhost:3101
 *
 * Produção:
 *   string vazia, usando a mesma origem que serviu a SPA.
 *
 * VITE_API_BASE_URL continua disponível para cenários em que
 * frontend e backend estejam hospedados em origens diferentes.
 */
const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL
    ?.trim();

export const API_BASE_URL =
  configuredBaseUrl
    ? configuredBaseUrl.replace(/\/+$/, "")
    : import.meta.env.DEV
      ? "http://localhost:3101"
      : "";

export function apiUrl(path: string): string {
  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}
