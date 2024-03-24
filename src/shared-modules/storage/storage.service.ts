import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileDto } from './storage.dtos';

@Injectable()
export class StorageService {
  private storage: Storage;

  private readonly PrivateBucketName = 'alhkq-private';
  private readonly PublicBucketName = 'alhkq-public';

  constructor() {
    this.storage = new Storage({
      keyFilename: join(
        __dirname,
        '../../../comp1640-vcl-gw-9a6eb7034a1f.json',
      ),
    });
  }

  /**
   * Uploads a public file to the storage bucket.
   * @param file - The file to be uploaded.
   * @returns A Promise that resolves to the public URL of the uploaded file.
   */
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

  /**
   * Deletes a public file from the storage.
   * @param publicUrl - The public URL of the file to be deleted.
   * @returns A Promise that resolves when the file is successfully deleted.
   */
  async deletePublicFile(publicUrl: string): Promise<void> {
    const encodedFileName = publicUrl.split('/').pop();
    const fileName = decodeURIComponent(encodedFileName);
    await this.storage.bucket(this.PublicBucketName).file(fileName).delete();
    return;
  }

  /**
   * Uploads private files to the storage service.
   * @param files - An array of Express.Multer.File objects representing the files to be uploaded.
   * @returns A Promise that resolves to an array of FileDto objects representing the uploaded files.
   */
  async uploadPrivateFiles(files: Express.Multer.File[]): Promise<FileDto[]> {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = uuidv4() + '/' + file.originalname;
        await this.storage
          .bucket(this.PrivateBucketName)
          .file(fileName)
          .save(file.buffer);
        return {
          file_name: file.originalname,
          file_url: fileName,
        };
      }),
    );
    return uploadedFiles;
  }

  /**
   * Retrieves the signed URLs for private files.
   * @param files - An array of FileDto objects.
   * @returns A Promise that resolves to an array of FileDto objects with signed URLs.
   */
  async getPrivateFilesUrls(files: FileDto[]): Promise<FileDto[]> {
    return Promise.all(
      files.map(async (file) => {
        const fileUrl = await this.storage
          .bucket(this.PrivateBucketName)
          .file(file.file_url)
          .getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 1,
          });
        return {
          file_name: file.file_name,
          file_url: fileUrl.toString(),
        };
      }),
    );
  }

  async deletePrivateFile(fileName: string): Promise<void> {
    await this.storage.bucket(this.PrivateBucketName).file(fileName).delete();
    return;
  }
}
