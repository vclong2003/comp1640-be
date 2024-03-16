import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { FileResponseDto } from './storage.dtos';

@Injectable()
export class StorageService {
  private storage: Storage;

  private readonly PrivateBucketName = 'alhkq-private';
  private readonly PublicBucketName = 'alhkq-public';

  private readonly AvatarImagesFolder = 'avatar-images/';
  private readonly ContributionImagesFolder = 'contribution-images/';
  private readonly ContributionDocumentsFolder = 'contribution-documents/';

  constructor() {
    this.storage = new Storage({
      keyFilename: join(
        __dirname,
        '../../../comp1640-vcl-gw-9a6eb7034a1f.json',
      ),
    });
  }

  // Avatar Images -------------------------------------------------------------
  async uploadAvatarImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    await this.removeAvatarImage(userId);

    const fileName = this.AvatarImagesFolder + userId + '/' + file.originalname;

    await this.storage
      .bucket(this.PublicBucketName)
      .file(fileName)
      .save(file.buffer);

    return this.storage
      .bucket(this.PublicBucketName)
      .file(fileName)
      .publicUrl();
  }

  async removeAvatarImage(userId: string) {
    const [files] = await this.storage.bucket(this.PublicBucketName).getFiles({
      prefix: this.AvatarImagesFolder + userId + '/',
    });

    await Promise.all(
      files.map(async (file) => {
        await file.delete();
      }),
    );
  }

  // Contribution Documents -----------------------------------------------------
  async uploadContributionDocuments(
    contributionId: string,
    files: Express.Multer.File[],
  ) {
    await Promise.all(
      files.map(async (file) => {
        const fileName =
          this.ContributionDocumentsFolder +
          contributionId +
          '/' +
          file.originalname;

        await this.storage
          .bucket(this.PrivateBucketName)
          .file(fileName)
          .save(file.buffer);
      }),
    );
  }

  async getContributionDocuments(
    contributionId: string,
  ): Promise<FileResponseDto[]> {
    const [files] = await this.storage.bucket(this.PrivateBucketName).getFiles({
      prefix: this.ContributionDocumentsFolder + contributionId + '/',
    });

    const fileResponses: FileResponseDto[] = await Promise.all(
      files.map(async (file) => {
        const fileUrl = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 1000 * 60 * 60 * 12,
        });

        return {
          file_name: file.name,
          file_url: fileUrl.toString(),
        };
      }),
    );

    return fileResponses;
  }

  // Contribution Images -------------------------------------------------------
  async uploadContributionImages(
    contributionId: string,
    files: Express.Multer.File[],
  ) {
    await Promise.all(
      files.map(async (file) => {
        const fileName =
          this.ContributionImagesFolder +
          contributionId +
          '/' +
          file.originalname;

        await this.storage
          .bucket(this.PrivateBucketName)
          .file(fileName)
          .save(file.buffer);
      }),
    );
  }

  async getContributionImages(
    contributionId: string,
  ): Promise<FileResponseDto[]> {
    const [files] = await this.storage.bucket(this.PrivateBucketName).getFiles({
      prefix: this.ContributionImagesFolder + contributionId + '/',
    });

    const fileResponses: FileResponseDto[] = await Promise.all(
      files.map(async (file) => {
        const fileUrl = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 1000 * 60 * 60 * 12,
        });

        return {
          file_name: file.name,
          file_url: fileUrl.toString(),
        };
      }),
    );

    return fileResponses;
  }

  // General -------------------------------------------------------------------
  async removeFile(fileName: string) {
    await this.storage.bucket(this.PrivateBucketName).file(fileName).delete();
  }
}
