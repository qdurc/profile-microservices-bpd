import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KEY_ID_HEADER,
  KEY_SIGNATURE_HEADER,
  KEY_TIMESTAMP_HEADER,
} from './security.constants';
import { keyPairSignature, secureCompare } from './security.utils';

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

@Injectable()
export class KeyPairGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const keyId = request.headers[KEY_ID_HEADER] as string | undefined;
    const signature = request.headers[KEY_SIGNATURE_HEADER] as string | undefined;
    const timestamp = request.headers[KEY_TIMESTAMP_HEADER] as string | undefined;

    if (!keyId || !signature || !timestamp) {
      throw new UnauthorizedException('Missing key pair headers');
    }

    const expectedKeyId = this.config.getOrThrow<string>('KEY_PAIR_ID');
    const keySecret = this.config.getOrThrow<string>('KEY_PAIR_SECRET');
    const requestTime = Date.parse(timestamp);

    if (
      Number.isNaN(requestTime) ||
      Math.abs(Date.now() - requestTime) > MAX_CLOCK_SKEW_MS
    ) {
      throw new UnauthorizedException('Invalid key pair timestamp');
    }

    const expectedSignature = keyPairSignature(
      request.method,
      request.originalUrl ?? request.url,
      timestamp,
      keySecret,
    );

    if (
      !secureCompare(keyId, expectedKeyId) ||
      !secureCompare(signature, expectedSignature)
    ) {
      throw new UnauthorizedException('Invalid key pair signature');
    }

    return true;
  }
}
