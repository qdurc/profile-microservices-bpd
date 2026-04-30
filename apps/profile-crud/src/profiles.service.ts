import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  createProfileToken,
  isValidProfileToken,
  sha256,
} from '@app/common';
import { CreateProfileDto, UpdateProfileDto } from './profile.dto';
import { Profile, ProfileDocument } from './profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateProfileDto) {
    const profile = new this.profileModel({
      ...dto,
      tokenHash: 'pending',
    });
    const token = createProfileToken(profile.id, this.tokenSecret);
    profile.tokenHash = sha256(token, this.tokenSecret);

    try {
      const saved = await profile.save();
      return {
        profile: this.toResponse(saved),
        token,
      };
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new ConflictException('A profile with this email already exists');
      }
      throw error;
    }
  }

  async findById(id: string) {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.toResponse(profile);
  }

  async update(id: string, dto: UpdateProfileDto, token: string | undefined) {
    await this.assertToken(id, token);

    try {
      const profile = await this.profileModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .exec();

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      return this.toResponse(profile);
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new ConflictException('A profile with this email already exists');
      }
      throw error;
    }
  }

  async delete(id: string, token: string | undefined) {
    await this.assertToken(id, token);
    const profile = await this.profileModel.findByIdAndDelete(id).exec();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return { deleted: true, id };
  }

  private async assertToken(id: string, token: string | undefined) {
    if (!token || !isValidProfileToken(token, id, this.tokenSecret)) {
      throw new UnauthorizedException('Invalid profile token');
    }

    const profile = await this.profileModel
      .findById(id)
      .select('+tokenHash')
      .exec();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.tokenHash !== sha256(token, this.tokenSecret)) {
      throw new UnauthorizedException('Invalid profile token');
    }
  }

  private toResponse(profile: ProfileDocument) {
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      createdAt: profile.get('createdAt'),
      updatedAt: profile.get('updatedAt'),
    };
  }

  private get tokenSecret(): string {
    return this.config.getOrThrow<string>('TOKEN_SECRET');
  }

  private isDuplicateKey(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
