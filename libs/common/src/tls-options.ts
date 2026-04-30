import { readFileSync } from 'fs';

export function getHttpsOptions() {
  const certPath = process.env.TLS_CERT_PATH;
  const keyPath = process.env.TLS_KEY_PATH;

  if (!certPath || !keyPath) {
    return undefined;
  }

  return {
    cert: readFileSync(certPath),
    key: readFileSync(keyPath),
    minVersion: 'TLSv1.2' as const,
  };
}
