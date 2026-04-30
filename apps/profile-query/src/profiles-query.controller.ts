import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BasicAuthGuard, KeyPairGuard } from '@app/common';
import { ProfilesQueryService } from './profiles-query.service';

@Controller()
export class ProfilesQueryController {
  constructor(private readonly profilesQueryService: ProfilesQueryService) {}

  @Get('get-profile/:id')
  @UseGuards(BasicAuthGuard, KeyPairGuard)
  getProfile(@Param('id') id: string) {
    return this.profilesQueryService.getProfile(id);
  }
}
