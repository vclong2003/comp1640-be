export class FileDto {
  file_name: string;
  file_url: string;
  file_access_url?: string;
}

export class FoldersToZipDto {
  files_url: string[];
  folder_name: string;
}
