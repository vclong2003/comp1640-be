export class AddContributionResponseDto {
  _id: string;
}

export class ContributionResponseDto {
  _id: string;
  title: string;
  description: string;
  banner_image_url: string;
  submitted_at: Date;
  is_publication: boolean;
  is_editable: boolean;
  author: {
    _id: string;
    avatar_url: string;
    email: string;
    name: string;
  };
  faculty: {
    _id: string;
    name: string;
  };
  event: {
    _id: string;
    name: string;
  };
  documents: {
    file_name: string;
    file_url: string;
  }[];
  images: {
    file_name: string;
    file_url: string;
  }[];
}

export class ContributionsResponseDto {
  _id: string;
  title: string;
  description: string;
  banner_image_url: string;
  submitted_at: Date;
  is_publication: boolean;
  is_editable: boolean;
  author: {
    _id: string;
    avatar_url: string;
    email: string;
    name: string;
  };
  faculty: {
    _id: string;
    name: string;
  };
  event: {
    _id: string;
    name: string;
  };
}
