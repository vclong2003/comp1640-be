import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import { CreateEventDTO, UpdateEventDTO } from './event.dtos';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles([ERole.Admin, ERole.MarketingCoordinator])
  create(@Body() createEventDto: CreateEventDTO) {
    return this.eventService.createEvent(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
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
