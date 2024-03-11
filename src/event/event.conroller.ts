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
import { CreateEventDTO } from './dtos/create-event.dto'; // Import the missing CreateEventDto
import { UpdateEventDTO } from './dtos/update-event.dto';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Post()
  create(@Body() createEventDto: CreateEventDTO) {
    return this.eventService.createEvent(createEventDto);
  }
  @Get()
  findAll() {
    return this.eventService.getAllEvent();
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDTO) {
    // Fix the parameter name
    return this.eventService.updateEvent(id, updateEventDto); // Fix the method call
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.removeEvent(id);
  }
}
