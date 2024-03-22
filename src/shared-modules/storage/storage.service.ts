import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ContributionFile } from 'src/contribution/schemas/contribution-file.schemas';
import { FileDto } from './storage.dtos';

@Injectable()
export class StorageService {
  private storage: Storage;

  private readonly PrivateBucketName = 'alhkq-private';
  private readonly PublicBucketName = 'alhkq-public';

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

  async uploadPublicFile(file: Express.Multer.File): Promise<string> {
    const fileName = uuidv4() + '/' + file.originalname;
    await this.storage
      .bucket(this.PublicBucketName)
      .file(fileName)
      .save(file.buffer);
    return this.storage
      .bucket(this.PublicBucketName)
      .file(fileName)
      .publicUrl();
  }

  async deletePublicFile(publicUrl: string): Promise<void> {
    const encodedFileName = publicUrl.split('/').pop();
    const fileName = decodeURIComponent(encodedFileName);
    await this.storage.bucket(this.PublicBucketName).file(fileName).delete();
    return;
  }

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
  ): Promise<FileDto[]> {
    const fileResponses: FileDto[] = await Promise.all(
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
  ): Promise<FileDto[]> {
    const fileResponses: FileDto[] = await Promise.all(
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

  async removeFile(fileName: string) {
    await this.storage.bucket(this.PrivateBucketName).file(fileName).delete();
  }
}
