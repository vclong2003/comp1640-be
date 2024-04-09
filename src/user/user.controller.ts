import {
  BadRequestException,
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
import { FindUsersDto, UpdateUserDto, UserResponseDto } from './user.dtos';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { EGender, ERole } from './user.enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // Get my profile --------------------------------------------
  @Get('/my-profile')
  async getMyProfile(@Req() req): Promise<UserResponseDto> {
    return await this.userService.findUserById(req.user._id);
  }

  // Update my profile -----------------------------------------
  @Put('/my-profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        dob: { type: 'string', format: 'date' },
        gender: { type: 'string', enum: Object.values(EGender) },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMyProfile(
    @Req() req,
    @UploadedFile() avatar: Express.Multer.File,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUserById(req.user._id, dto, avatar);
  }

  // Find users ------------------------------------------------
  @Get('/')
  async findUsers(@Query() dto: FindUsersDto): Promise<UserResponseDto[]> {
    return await this.userService.findUsers(dto);
  }

  // Find user by id -------------------------------------------
  @Get('/:userId')
  @Roles([ERole.Admin])
  async findUserById(
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    return await this.userService.findUserById(userId);
  }

  // Update user by id -----------------------------------------
  @Put('/:userId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        facultyId: { type: 'string' },
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
  ): Promise<UserResponseDto> {
    return await this.userService.updateUserById(userId, dto, avatar);
  }

  // Disable user ----------------------------------------------
  @Post('/:userId/disable')
  @Roles([ERole.Admin])
  async disableUser(
    @Req() req,
    @Param('userId') userId: string,
  ): Promise<void> {
    if (req.user._id === userId) {
      throw new BadRequestException('Cannot disable yourself!');
    }
    return await this.userService.disableUser(userId);
  }

  // Enable user -----------------------------------------------
  @Post('/:userId/enable')
  @Roles([ERole.Admin])
  async enableUser(@Param('userId') userId: string): Promise<void> {
    return await this.userService.enableUser(userId);
  }
}
