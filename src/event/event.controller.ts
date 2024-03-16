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
import { CreateEventDTO, FindEventsDTO, UpdateEventDTO } from './event.dtos';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async createEvent(@Req() req, @Body() dto: CreateEventDTO) {
    if (req.user.role === ERole.MarketingCoordinator) {
      return await this.eventService.createEventByUserFaculty(
        req.user._id,
        dto,
      );
    }
    return await this.eventService.createEvent(dto);
  }

  @Get('all')
  async findEvents(@Req() req, @Query() dto: FindEventsDTO) {
    if (
      req.user.role === ERole.Student ||
      req.user.role === ERole.MarketingCoordinator
    ) {
      return await this.eventService.findEventsByUserFaculty(
        req.user.faculty._id,
        dto,
      );
    }
    return await this.eventService.findEvents(dto);
  }

  @Get(':eventId')
  async getEventDetails(@Param('eventId') eventId: string) {
    return await this.eventService.getEventDetails(eventId);
  }

  @Put(':eventId')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async updateEvent(
    @Req() req,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDTO,
  ) {
    if (req.user.role === ERole.MarketingCoordinator) {
      return await this.eventService.updateEventByUserFaculty(
        req.user._id,
        eventId,
        dto,
      );
    }
    return await this.eventService.updateEvent(eventId, dto);
  }

  @Delete(':eventId')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  async deleteEvent(@Req() req, @Param('eventId') eventId: string) {
    if (req.user.role === ERole.MarketingCoordinator) {
      return await this.eventService.removeEventFromUserFaculty(
        req.user._id,
        eventId,
      );
    }
    return await this.eventService.removeEvent(eventId);
  }
}
