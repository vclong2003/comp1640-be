import { SetMetadata } from '@nestjs/common';

export const NO_ACCESS_TOKEN_KEY = 'isNoAccessTokenRequired';
export const NoAccessToken = () => SetMetadata(NO_ACCESS_TOKEN_KEY, true);
