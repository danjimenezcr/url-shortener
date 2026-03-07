export interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  updatedAt?: string;
  clickCount: number;
  shortUrl?: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
}

export interface CreateUrlResponse {
  _id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  shortUrl: string;
}
