import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dtos';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  async getUserDetails(@Req() req) {
    return await this.userService.findOneById(req.user._id);
  }

  @Post('')
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(req.user._id, dto);
  }
}
