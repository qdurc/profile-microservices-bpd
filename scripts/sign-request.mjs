import { createHmac } from 'crypto';

const [method, path] = process.argv.slice(2);
const keyId = process.env.KEY_PAIR_ID ?? 'bpd-profile-ms-2026';
const keySecret = process.env.KEY_PAIR_SECRET ?? 'bpd-profile-shared-key-local';

if (!method || !path) {
  console.error('Usage: node scripts/sign-request.mjs <METHOD> <PATH>');
  process.exit(1);
}

const timestamp = new Date().toISOString();
const signature = createHmac('sha256', keySecret)
  .update(`${method.toUpperCase()}:${path}:${timestamp}`)
  .digest('hex');

console.log(`-H "x-key-id: ${keyId}"`);
console.log(`-H "x-key-timestamp: ${timestamp}"`);
console.log(`-H "x-key-signature: ${signature}"`);
