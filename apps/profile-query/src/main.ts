import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getHttpsOptions } from '@app/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: getHttpsOptions(),
  });

  const config = app.get(ConfigService);
  await app.listen(config.get<number>('PROFILE_QUERY_PORT', 3000));
}

bootstrap();
