import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  Delete,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import {
  CreateEventDTO,
  EventResponseDto,
  FindEventsDTO,
  UpdateEventDTO,
} from './event.dtos';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Find event by id ---------------------------------------------------------
  @Get(':eventId')
  async findEvent(
    @Param('eventId') eventId: string,
  ): Promise<EventResponseDto> {
    return await this.eventService.findEventById(eventId);
  }

  // Create event -------------------------------------------------------------
  @Post('')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  @UseInterceptors(FileInterceptor('bannerImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        start_date: { type: 'string' },
        first_closure_date: { type: 'string' },
        final_closure_date: { type: 'string' },
        facultyId: { type: 'string' },
        bannerImage: { type: 'string', format: 'binary' },
      },
    },
  })
  async createEvent(
    @Req() req,
    @Body() dto: CreateEventDTO,
    @UploadedFile() bannerImage?: Express.Multer.File,
  ): Promise<EventResponseDto> {
    return await this.eventService.createEvent(dto, bannerImage);
  }

  // Update event -------------------------------------------------------------
  @Put(':eventId')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  @UseInterceptors(FileInterceptor('bannerImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        start_date: { type: 'string' },
        first_closure_date: { type: 'string' },
        final_closure_date: { type: 'string' },
        bannerImage: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDTO,
    @UploadedFile() bannerImage?: Express.Multer.File,
  ): Promise<EventResponseDto> {
    return await this.eventService.updateEvent(eventId, dto, bannerImage);
  }

  // Find events ----------------------------------------------------------
  @Get('')
  async findEvents(
    @Req() req,
    @Query() dto: FindEventsDTO,
  ): Promise<
    Omit<EventResponseDto, 'description' | 'banner_image_url' | 'faculty.mc'>[]
  > {
    return await this.eventService.findEvents(dto);
  }

  // Delete event -------------------------------------------------------------
  @Delete(':eventId')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async deleteEvent(
    @Req() req,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    return await this.eventService.removeEvent(eventId);
  }
}
