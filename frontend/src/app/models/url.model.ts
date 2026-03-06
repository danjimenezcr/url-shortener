export interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  updatedAt: Date;
  clickCount: number;
}

export interface CreateUrlRequest {
  originalUrl: string;
}

export interface CreateUrlResponse {
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
}
