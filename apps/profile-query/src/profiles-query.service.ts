import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KEY_ID_HEADER,
  KEY_SIGNATURE_HEADER,
  KEY_TIMESTAMP_HEADER,
  keyPairSignature,
} from '@app/common';

@Injectable()
export class ProfilesQueryService {
  constructor(private readonly config: ConfigService) {}

  async getProfile(id: string) {
    const path = `/profiles/${id}`;
    const baseUrl = this.config.getOrThrow<string>('PROFILE_CRUD_BASE_URL');
    const timestamp = new Date().toISOString();
    const keyId = this.config.getOrThrow<string>('KEY_PAIR_ID');
    const keySecret = this.config.getOrThrow<string>('KEY_PAIR_SECRET');

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: {
        [KEY_ID_HEADER]: keyId,
        [KEY_TIMESTAMP_HEADER]: timestamp,
        [KEY_SIGNATURE_HEADER]: keyPairSignature(
          'GET',
          path,
          timestamp,
          keySecret,
        ),
      },
    });

    if (response.status === 404) {
      throw new NotFoundException('Profile not found');
    }

    if (response.status === 401) {
      throw new UnauthorizedException('Internal profile service rejected request');
    }

    if (!response.ok) {
      throw new BadGatewayException('Profile CRUD service is unavailable');
    }

    return response.json();
  }
}
