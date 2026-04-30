import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BASIC_REALM } from './security.constants';
import { secureCompare } from './security.utils';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Basic ')) {
      this.reject();
    }

    const [username, password] = Buffer.from(
      authorization.slice('Basic '.length),
      'base64',
    )
      .toString('utf8')
      .split(':');

    const expectedUser = this.config.getOrThrow<string>('BASIC_AUTH_USER');
    const expectedPassword = this.config.getOrThrow<string>('BASIC_AUTH_PASSWORD');

    if (
      !username ||
      !password ||
      !secureCompare(username, expectedUser) ||
      !secureCompare(password, expectedPassword)
    ) {
      this.reject();
    }

    return true;
  }

  private reject(): never {
    throw new UnauthorizedException({
      message: 'Invalid Basic Auth credentials',
      wwwAuthenticate: `Basic realm="${BASIC_REALM}"`,
    });
  }
}
