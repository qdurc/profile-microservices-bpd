import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  BasicAuthGuard,
  KeyPairGuard,
  TOKEN_HEADER,
} from '@app/common';
import { CreateProfileDto, UpdateProfileDto } from './profile.dto';
import { ProfilesService } from './profiles.service';

@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('create-profile')
  @UseGuards(BasicAuthGuard, KeyPairGuard)
  create(@Body() dto: CreateProfileDto) {
    return this.profilesService.create(dto);
  }

  @Get('profiles/:id')
  @UseGuards(KeyPairGuard)
  findById(@Param('id') id: string) {
    return this.profilesService.findById(id);
  }

  @Put('update-profile/:id')
  @UseGuards(BasicAuthGuard, KeyPairGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @Headers(TOKEN_HEADER) token?: string,
  ) {
    return this.profilesService.update(id, dto, token);
  }

  @Delete('delete-profile/:id')
  @UseGuards(BasicAuthGuard, KeyPairGuard)
  delete(@Param('id') id: string, @Headers(TOKEN_HEADER) token?: string) {
    return this.profilesService.delete(id, token);
  }
}
