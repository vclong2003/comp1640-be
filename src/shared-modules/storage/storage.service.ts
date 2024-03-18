import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { FileResponseDto } from './storage.dtos';
import { v4 as uuidv4 } from 'uuid';
import { ContributionFile } from 'src/contribution/schemas/contribution-file.schemas';

@Injectable()
export class StorageService {
  private storage: Storage;

  private readonly PrivateBucketName = 'alhkq-private';
  private readonly PublicBucketName = 'alhkq-public';

  private readonly AvatarImagesFolder = 'avatar-images/';

  private readonly ContributionImagesFolder = 'contribution-images';
  private readonly ContributionDocumentsFolder = 'contribution-documents';

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
    files: Express.Multer.File[],
  ): Promise<ContributionFile[]> {
    const uploadedFile = await Promise.all(
      files.map(async (file) => {
        const fileUrl =
          this.ContributionDocumentsFolder +
          '/' +
          uuidv4() +
          '/' +
          file.originalname;

        await this.storage
          .bucket(this.PrivateBucketName)
          .file(fileUrl)
          .save(file.buffer);

        return {
          file_name: file.originalname,
          file_url: fileUrl,
        };
      }),
    );

    return uploadedFile;
  }

  async getContributionDocuments(
    savedFiles: ContributionFile[],
  ): Promise<FileResponseDto[]> {
    const fileResponses: FileResponseDto[] = await Promise.all(
      savedFiles.map(async (file) => {
        const fileUrl = await this.storage
          .bucket(this.PrivateBucketName)
          .file(file.file_url)
          .getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 12,
          });

        return {
          file_name: file.file_name,
          file_url: fileUrl.toString(),
        };
      }),
    );

    return fileResponses;
  }

  // Contribution Images -------------------------------------------------------
  async uploadContributionImages(files: Express.Multer.File[]) {
    const uploadedFile = await Promise.all(
      files.map(async (file) => {
        const fileUrl =
          this.ContributionImagesFolder +
          '/' +
          uuidv4() +
          '/' +
          file.originalname;

        await this.storage
          .bucket(this.PrivateBucketName)
          .file(fileUrl)
          .save(file.buffer);

        return {
          file_name: file.originalname,
          file_url: fileUrl,
        };
      }),
    );

    return uploadedFile;
  }

  async getContributionImages(
    savedFiles: ContributionFile[],
  ): Promise<FileResponseDto[]> {
    const fileResponses: FileResponseDto[] = await Promise.all(
      savedFiles.map(async (file) => {
        const fileUrl = await this.storage
          .bucket(this.PrivateBucketName)
          .file(file.file_url)
          .getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 12,
          });

        return {
          file_name: file.file_name,
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
