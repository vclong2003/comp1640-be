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
} from '@nestjs/common';
import { EventService } from './event.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import {
  CreateEventDTO,
  EventResponseDto,
  EventsResponseDto,
  FindEventsDTO,
  UpdateEventDTO,
} from './event.dtos';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get(':eventId')
  async findEvent(
    @Param('eventId') eventId: string,
  ): Promise<EventResponseDto> {
    return await this.eventService.findEventById(eventId);
  }

  @Post('')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async createEvent(
    @Req() req,
    @Body() dto: CreateEventDTO,
  ): Promise<EventResponseDto> {
    return await this.eventService.createEvent(dto);
  }

  @Get('')
  async findEvents(
    @Req() req,
    @Query() dto: FindEventsDTO,
  ): Promise<EventsResponseDto[]> {
    return await this.eventService.findEvents(dto);
  }

  @Put(':eventId')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async updateEvent(
    @Req() req,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDTO,
  ): Promise<EventResponseDto> {
    return await this.eventService.updateEvent(eventId, dto);
  }

  @Delete(':eventId')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async deleteEvent(
    @Req() req,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    return await this.eventService.removeEvent(eventId);
  }
}
