export interface Visit {
  _id: string;
  urlId: string;
  ipAddress: string;
  timestamp: Date;
  userAgent?: string;
}

export interface UrlStatistics {
  totalVisits: number;
  visits: Visit[];
  daily?: { [key: string]: number };
}
