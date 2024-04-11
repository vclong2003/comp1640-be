import { Storage } from '@google-cloud/storage';
import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileDto, FoldersToZipDto } from './storage.dtos';
import * as JSZip from 'jszip';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private storage: Storage;

  private readonly PrivateBucketName = 'alhkq-private';
  private readonly PublicBucketName = 'alhkq-public';

  private readonly FILE_BYTES_LIMIT = 25 * 1024 * 1024; // 25MB

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
    this.ensureFileSizeLimit(file);

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
    await this.storage
      .bucket(this.PublicBucketName)
      .file(fileName)
      .delete()
      .catch((error) => {
        console.error('Error deleting file:', error);
        return;
      });
    return;
  }

  /**
   * Uploads private files to the storage service.
   * @param files - An array of Express.Multer.File objects representing the files to be uploaded.
   * @returns A Promise that resolves to an array of FileDto objects representing the uploaded files.
   */
  async uploadPrivateFiles(files: Express.Multer.File[]): Promise<FileDto[]> {
    files.forEach((file) => this.ensureFileSizeLimit(file));

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
        const accessUrl = await this.storage
          .bucket(this.PrivateBucketName)
          .file(file.file_url)
          .getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60 * 1,
          });
        return {
          file_name: file.file_name,
          file_url: file.file_url,
          file_access_url: accessUrl.toString(),
        };
      }),
    );
  }

  /**
   * Organizes and zips the specified folders and files.
   * @param foldersAndFiles - An array of objects containing folder names and file URLs.
   * @returns A Promise that resolves to a NodeJS ReadableStream representing the zipped files.
   */
  async organizeAndZipFiles(
    foldersAndFiles: FoldersToZipDto[],
  ): Promise<NodeJS.ReadableStream> {
    const zip = new JSZip();

    await Promise.all(
      foldersAndFiles.map(async ({ folder_name, files_url }) => {
        const folder = zip.folder(folder_name);

        await Promise.all(
          files_url.map(async (fileUrl) => {
            const [file] = await this.storage
              .bucket(this.PrivateBucketName)
              .file(fileUrl)
              .download();

            folder.file(fileUrl.split('/').pop()!, file);
          }),
        );
      }),
    );
    const zipStream = await zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true,
    });
    return zipStream;
  }

  /**
   * Deletes a private file from the storage.
   * @param fileName - The name of the file to be deleted.
   * @returns A Promise that resolves when the file is successfully deleted.
   */
  async deletePrivateFile(fileName: string): Promise<void> {
    await this.storage.bucket(this.PrivateBucketName).file(fileName).delete();
    return;
  }

  /**
   * Resizes an image file to the specified width.
   * @param file - The image file to resize.
   * @param width - The desired width of the resized image.
   * @returns A Promise that resolves to the resized image file.
   * @throws Error if the provided file is not an image.
   */
  async resizeImage(
    file: Express.Multer.File,
    width: number,
  ): Promise<Express.Multer.File> {
    this.ensureFileIsImage(file);
    return await sharp(file.buffer)
      .resize(width)
      .toBuffer()
      .then((buffer) => ({ ...file, buffer }));
  }

  // Check if the file is an image
  ensureFileIsImage(file: Express.Multer.File): void {
    if (file.mimetype.split('/')[0] !== 'image') {
      throw new BadRequestException('File is not an image');
    }
  }

  // Check if the file size is within the limit
  ensureFileSizeLimit(file: Express.Multer.File): void {
    if (file.size > this.FILE_BYTES_LIMIT) {
      throw new BadRequestException(
        `The file ${file.originalname} is too large. The maximum file size is 25MB.`,
      );
    }
  }
}
