import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { AmenitiesModule } from './amenities/amenities.module';

@Module({
  imports: [PrismaModule, AuthModule, PropertiesModule, AmenitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
