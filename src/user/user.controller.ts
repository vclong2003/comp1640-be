import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FindUsersDto, UpdateUserDto } from './user.dtos';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from './user.enums';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  async getUserDetails(@Req() req) {
    return await this.userService.findOneById(req.user._id);
  }

  @Put('')
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(req.user._id, dto);
  }

  @Get('/all')
  async findUsers(@Query() dto: FindUsersDto) {
    return await this.userService.findUsers(dto);
  }

  @Get('/:userId')
  @Roles([ERole.Admin])
  async getUserById(@Param('userId') userId: string) {
    return await this.userService.findOneById(userId);
  }

  @Post('/:userId')
  @Roles([ERole.Admin])
  async updateUserById(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, dto);
  }

  @Post('/:userId/disable')
  @Roles([ERole.Admin])
  async disableUser(@Param('userId') userId: string) {
    return await this.userService.disableUser(userId);
  }

  @Post('/:userId/enable')
  @Roles([ERole.Admin])
  async enableUser(@Param('userId') userId: string) {
    return await this.userService.enableUser(userId);
  }
}
