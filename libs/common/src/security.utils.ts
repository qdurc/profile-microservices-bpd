import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export function sha256(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function createProfileToken(profileId: string, secret: string): string {
  const nonce = randomBytes(24).toString('hex');
  const signature = sha256(`${profileId}.${nonce}`, secret);
  return `${profileId}.${nonce}.${signature}`;
}

export function isValidProfileToken(
  token: string,
  profileId: string,
  secret: string,
): boolean {
  const [tokenProfileId, nonce, signature] = token.split('.');
  if (!tokenProfileId || !nonce || !signature || tokenProfileId !== profileId) {
    return false;
  }

  return secureCompare(signature, sha256(`${profileId}.${nonce}`, secret));
}

export function keyPairSignature(
  method: string,
  path: string,
  timestamp: string,
  keySecret: string,
): string {
  return sha256(`${method.toUpperCase()}:${path}:${timestamp}`, keySecret);
}

export function secureCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
