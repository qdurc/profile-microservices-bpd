import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from '@app/common';
import { ProfilesQueryController } from './profiles-query.controller';
import { ProfilesQueryService } from './profiles-query.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SecurityModule],
  controllers: [ProfilesQueryController],
  providers: [ProfilesQueryService],
})
export class AppModule {}
