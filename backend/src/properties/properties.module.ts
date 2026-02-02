import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { MailerService } from '../auth/mailer.service';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, MailerService],
})
export class PropertiesModule {}
