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
import { CreateEventDTO, FindEventDTO, UpdateEventDTO } from './event.dtos';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  create(@Body() createEventDto: CreateEventDTO) {
    return this.eventService.createEvent(createEventDto);
  }

  @Get('')
  @Roles([ERole.MarketingCoordinator, ERole.Student, ERole.Guest])
  async findEventsByUserFaculty(@Req() req, @Query() dto: FindEventDTO) {
    return await this.eventService.findEventsByUserFaculty(req.user._id, dto);
  }

  @Get('')
  @Roles([ERole.Admin])
  async findEvents(@Query() dto: FindEventDTO) {
    return await this.eventService.findEvents(dto);
  }

  @Get(':eventId')
  async getEventDetails(@Param('eventId') eventId: string) {
    return await this.eventService.getEventDetails(eventId);
  }

  @Put(':id')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDTO) {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  remove(@Param('id') id: string) {
    return this.eventService.removeEvent(id);
  }
}
