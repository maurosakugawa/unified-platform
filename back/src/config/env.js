import dotenv from 'dotenv';
import {
  dirname,
  isAbsolute,
  resolve,
} from 'path';
import {
  fileURLToPath,
} from 'url';

const currentFile =
  fileURLToPath(import.meta.url);

export const BACKEND_ROOT =
  resolve(
    dirname(currentFile),
    '../..'
  );

export const PROJECT_ROOT =
  resolve(
    BACKEND_ROOT,
    '..'
  );

/**
 * Carrega sempre back/.env, independentemente do diretório
 * em que o processo Node foi iniciado.
 *
 * Variáveis já presentes no ambiente têm precedência.
 */
dotenv.config({
  path: resolve(
    BACKEND_ROOT,
    '.env'
  ),
});

export function resolveBackendPath(
  value,
  fallback
) {
  const selected =
    value?.trim()
    || fallback;

  return isAbsolute(selected)
    ? selected
    : resolve(
        BACKEND_ROOT,
        selected
      );
}

export function envFlag(
  name,
  fallback = false
) {
  const value =
    process.env[name];

  if (
    typeof value ===
    'undefined'
  ) {
    return fallback;
  }

  return [
    '1',
    'true',
    'yes',
    'on',
  ].includes(
    value
      .trim()
      .toLowerCase()
  );
}
