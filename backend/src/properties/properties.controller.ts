import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { ListPropertiesQuery } from './dto/list-properties.query';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListFeaturedPropertiesQuery } from './dto/list-featured-properties.query';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('metadata')
  metadata() {
    return this.propertiesService.metadata();
  }

  @Get('featured')
  featured(@Query() query: ListFeaturedPropertiesQuery) {
    return this.propertiesService.featured(query);
  }

  @Get()
  list(@Query() query: ListPropertiesQuery) {
    return this.propertiesService.list(query);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const property = await this.propertiesService.getById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  @Get(':id/similar')
  async similar(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.propertiesService.similar(
      id,
      limit ? Number(limit) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.userId, dto);
  }
}
