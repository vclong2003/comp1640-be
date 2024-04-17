export class SendGuestRegisterEmailDto {
  email: string;
  url: string;
}

export class SendResetPasswordEmailDto {
  email: string;
  name: string;
  url: string;
}

export class SendNewContributionEmailDto {
  mcEmail: string;
  mcName: string;
  studentName: string;
  contributionUrl: string;
}

export class SendContributionPublishedEmailDto {
  authorEmail: string;
  authorName: string;
  contributionUrl: string;
}
