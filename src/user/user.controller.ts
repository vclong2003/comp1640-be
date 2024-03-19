import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FindUsersDto, UpdateUserDto } from './user.dtos';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from './user.enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Put('/my-profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        dob: { type: 'string', format: 'date' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(req.user._id, dto, avatar);
  }

  @Get('/')
  async findUsers(@Query() dto: FindUsersDto) {
    return await this.userService.findUsers(dto);
  }

  @Get('/:userId')
  @Roles([ERole.Admin])
  async getUserById(@Param('userId') userId: string) {
    return await this.userService.findOneById(userId);
  }

  @Put('/:userId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        dob: { type: 'string', format: 'date' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @Roles([ERole.Admin])
  async updateUserById(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return await this.userService.updateUser(userId, dto, avatar);
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
