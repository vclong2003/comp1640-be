import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ERole } from 'src/user/user.enums';
import { ContributionService } from './contribution.service';
import { ApiBody, ApiConsumes, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AddCommentDto } from './comment.dtos';

import {
  AddContributionDto,
  AddContributionResponseDto,
  ContributionFilesDto,
  ContributionResponseDto,
  GetContributionsDto,
  NumberOfContributionsByFacultyPerYearDto,
  TotalNumberOfContributionByFacultyDto,
  UpdateContributionDto,
} from './contribution.dtos';

@Controller('contribution')
export class ContributionController {
  constructor(private contributionService: ContributionService) {}
  // Get yearly analysis ----------------------------------------------
  @Get('yearly-analysis/:year')
  @Roles([ERole.Admin])
  async getYearlyAnalysis(
    @Param('year') year: number,
  ): Promise<NumberOfContributionsByFacultyPerYearDto[]> {
    return await this.contributionService.yearlyAnalysis(year);
  }

  // Get lifetime analysis ----------------------------------------------
  @Get('lifetime-analysis')
  @Roles([ERole.Admin])
  async getLifetimeAnalysis(): Promise<
    TotalNumberOfContributionByFacultyDto[]
  > {
    return await this.contributionService.lifetimeAnalysis();
  }

  // Add contribution ----------------------------------------
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        eventId: { type: 'string' },
        bannerImage: { type: 'string', format: 'binary' },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 5 },
      { name: 'images', maxCount: 5 },
      { name: 'bannerImage', maxCount: 1 },
    ]),
  )
  @Roles([ERole.Student])
  async addContribution(
    @Req() req,
    @Body() dto: AddContributionDto,
    @UploadedFiles()
    files: ContributionFilesDto,
  ): Promise<AddContributionResponseDto> {
    return await this.contributionService.addContribution(req.user, dto, files);
  }

  // Update contribution -------------------------------------------
  @Put(':contributionId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        bannerImage: { type: 'string', format: 'binary' },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 5 },
      { name: 'images', maxCount: 5 },
      { name: 'bannerImage', maxCount: 1 },
    ]),
  )
  @Roles([ERole.Student, ERole.MarketingCoordinator, ERole.Admin])
  async updateContribution(
    @Req() req,
    @Param('contributionId') contributionId: string,
    @Body() dto: UpdateContributionDto,
    @UploadedFiles()
    files: ContributionFilesDto,
  ) {
    return await this.contributionService.updateContribution(
      req.user,
      contributionId,
      dto,
      files,
    );
  }

  // Remove contribution file ----------------------------------------
  @Post(':contributionId/delete-file')
  @Roles([ERole.Student, ERole.MarketingCoordinator, ERole.Admin])
  async removeContributionFile(
    @Req() req,
    @Param('contributionId') contributionId: string,
    @Body() dto: { file_url: string },
  ) {
    return await this.contributionService.removeContributionFile(
      req.user,
      contributionId,
      dto.file_url,
    );
  }

  // Get contributions ----------------------------------------
  @Get('')
  async getContributions(
    @Req() req,
    @Query() dto: GetContributionsDto,
  ): Promise<Partial<ContributionResponseDto>[]> {
    return await this.contributionService.getContributions(req.user, dto);
  }

  // FindContributionsAndDownloadZip ----------------------------------------
  @ApiExcludeEndpoint()
  @Get('download')
  async findContributionsAndDownloadZip(
    @Query() dto: GetContributionsDto,
    @Res() res,
  ) {
    const file = await this.contributionService.zipContributions(dto);
    file.pipe(res);
  }

  // Find contribution by id ----------------------------------------
  @Get(':contributionId')
  async findContributionById(
    @Req() req,
    @Param('contributionId') contributionId: string,
  ): Promise<ContributionResponseDto> {
    return await this.contributionService.findContributionById(
      req.user,
      contributionId,
    );
  }

  // Remove contribution ----------------------------------------
  @Delete(':contributionId')
  @Roles([ERole.Student, ERole.MarketingCoordinator, ERole.Admin])
  async removeContribution(
    @Req() req,
    @Param('contributionId') contributionId: string,
  ) {
    return await this.contributionService.removeContribution(
      req.user,
      contributionId,
    );
  }

  // Find all comments ----------------------------------------
  @Get(':contributionId/comment')
  async findAllComments(@Param('contributionId') contributionId: string) {
    return await this.contributionService.findAllComments(contributionId);
  }

  // Add comment ----------------------------------------------
  @Post(':contributionId/comment')
  async addComment(
    @Req() req,
    @Param('contributionId') contributionId: string,
    @Body() dto: AddCommentDto,
  ) {
    return await this.contributionService.addComment(
      req.user,
      contributionId,
      dto,
    );
  }

  // Remove comment ----------------------------------------------
  @Delete(':contributionId/comment/:commentId')
  async removeComment(
    @Req() req,
    @Param('contributionId') contributionId: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.contributionService.removeComment(
      req.user,
      contributionId,
      commentId,
    );
  }
  // Find all private comments ----------------------------------------
  @Get(':contributionId/comment/private')
  @Roles([ERole.Student, ERole.MarketingCoordinator, ERole.Admin])
  async findAllPrivateComments(
    @Req() req,
    @Param('contributionId') contributionId: string,
  ) {
    return await this.contributionService.findAllPrivateComments(
      req.user,
      contributionId,
    );
  }

  // Add private comment ----------------------------------------------
  @Post(':contributionId/comment/private')
  @Roles([ERole.Student, ERole.MarketingCoordinator, ERole.Admin])
  async addPrivateComment(
    @Req() req,
    @Param('contributionId') contributionId: string,
    @Body() dto: AddCommentDto,
  ) {
    return await this.contributionService.addPrivateComment(
      req.user,
      contributionId,
      dto,
    );
  }

  // Remove private comment ----------------------------------------------
  @Delete(':contributionId/comment/private/:commentId')
  @Roles([ERole.Student, ERole.MarketingCoordinator, ERole.Admin])
  async removePrivateComment(
    @Req() req,
    @Param('contributionId') contributionId: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.contributionService.removePrivateComment(
      req.user,
      contributionId,
      commentId,
    );
  }

  // Like contribution ----------------------------------------------
  @Post(':contributionId/like')
  async likeContribution(
    @Req() req,
    @Param('contributionId') contributionId: string,
  ) {
    return await this.contributionService.likeContribution(
      req.user,
      contributionId,
    );
  }
}
